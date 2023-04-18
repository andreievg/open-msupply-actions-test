use std::{collections::HashMap, sync::Arc};

use actix_web::{
    web::{self, Data},
    App, HttpServer,
};
use chrono::{NaiveDateTime, Utc};
use repository::{
    mock::{insert_extra_mock_data, mock_store_a, mock_store_b, MockData, MockDataInserts},
    KeyValueStoreRow, KeyValueType, LocationRow,
};
use tokio::sync::Mutex;
use util::{assert_matches, inline_edit, inline_init};

use crate::{
    service_provider::ServiceProvider,
    sync::{
        api::{
            CentralSyncBatchV5, CentralSyncRecordV5, CommonSyncRecordV5, RemotePushResponseV5,
            RemoteSyncBatchV5, RemoteSyncRecordV5, SiteStatusCodeV5, SiteStatusV5,
        },
        settings::{BatchSize, SyncSettings},
        sync_status::{status::InitialisationStatus, SyncLogError},
        synchroniser::{SyncError, Synchroniser},
    },
    test_helpers::{setup_all_and_service_provider, ServiceTestContext},
};

use super::status::FullSyncStatus;

const PORT: u16 = 12345;

macro_rules! assert_between {
    ($compare: expr, $from: expr, $to: expr) => {
        assert!($compare > $from);
        assert!($compare < $to);
    };
}

#[actix_rt::test]
async fn sync_status() {
    let ServiceTestContext {
        connection,
        service_provider,
        service_context,
        ..
    } = setup_all_and_service_provider("sync_status", MockDataInserts::none().names().stores())
        .await;

    assert_eq!(
        service_provider
            .sync_status_service
            .get_initialisation_status(&service_context),
        Ok(InitialisationStatus::PreInitialisation)
    );

    // Test INITIALISATION
    let tester = get_initialisation_sync_status_tester(service_provider.clone());
    let tester_data = Data::new(Mutex::new(tester));
    run_server_and_sync(service_provider.clone(), tester_data.clone(), PORT)
        .await
        .unwrap();
    tester_data.lock().await.try_route("final".to_string());

    // Need to add sync settings so that Initialised returns site name
    service_provider
        .settings
        .update_sync_settings(
            &service_context,
            &SyncSettings {
                username: "site_name".to_string(),
                url: "http://test.com".to_string(),
                ..SyncSettings::default()
            },
        )
        .unwrap();

    assert_eq!(
        service_provider
            .sync_status_service
            .get_initialisation_status(&service_context),
        Ok(InitialisationStatus::Initialised("site_name".to_string()))
    );

    // Test PUSH and ERROR

    // Insert some location rows to be pushed
    insert_extra_mock_data(
        &connection,
        inline_init(|r: &mut MockData| {
            r.key_value_store_rows = vec![inline_init(|r: &mut KeyValueStoreRow| {
                r.id = KeyValueType::SettingsSyncSiteId;
                r.value_int = Some(mock_store_b().site_id);
            })];
            r.locations = (1..=3)
                .into_iter()
                .map(|i| {
                    inline_init(|r: &mut LocationRow| {
                        r.id = i.to_string();
                        r.store_id = mock_store_a().id;
                    })
                })
                .collect();
        }),
    );

    let ctx = service_provider.basic_context().unwrap();
    assert_eq!(
        service_provider
            .sync_status_service
            .number_of_records_in_push_queue(&ctx)
            .unwrap(),
        3
    );

    let tester = get_push_and_error_sync_status_tester(service_provider.clone());

    let tester_data = Data::new(Mutex::new(tester));
    let result = run_server_and_sync(service_provider.clone(), tester_data.clone(), PORT + 1).await;

    assert_matches!(result, Err(_));
    tester_data.lock().await.try_route("final".to_string());
}

/// Mount routes required for initialisation, checking sync status in each route
/// * /initialise
/// * /central_records
/// * /queued_records
/// * /acknowledged_records (placeholder)
/// * /site (placeholder)
/// * /final (manually called as last step)
fn get_initialisation_sync_status_tester(service_provider: Arc<ServiceProvider>) -> Tester {
    Tester::new(service_provider.clone())
        .add_test(
            "initialise",
            |TestInput {
                 previous_status,
                 current_status,
                 previous_datetime,
                 now,
                 ..
             }| {
                let new_status = inline_edit(&previous_status, |mut r| {
                    r.is_syncing = true;
                    r.summary = current_status.summary.clone();
                    r.prepare_initial = current_status.prepare_initial.clone();
                    r
                });
                assert_eq!(current_status, new_status);

                assert_between!(current_status.summary.started, previous_datetime, now);
                let prepare_initial = current_status.prepare_initial.unwrap();
                assert_between!(prepare_initial.started, previous_datetime, now);
                assert!(prepare_initial.finished.is_none());

                TestOutput {
                    new_status,
                    // Placeholder result
                    response: r#"{"queueLength": 2264}"#.to_string(),
                }
            },
        )
        .add_test(
            "central_records",
            |TestInput {
                 previous_status,
                 current_status,
                 previous_datetime,
                 now,
                 iteration,
             }| {
                let new_status = inline_edit(&previous_status, |mut r| {
                    if iteration == 0 {
                        r.prepare_initial = current_status.prepare_initial.clone()
                    }
                    // Even though push is not done start and end is logged
                    r.push = current_status.push.clone();
                    r.pull_central = current_status.pull_central.clone();
                    r
                });
                assert_eq!(current_status, new_status);

                let mut response_record = CentralSyncBatchV5 {
                    max_cursor: 3,
                    data: vec![CentralSyncRecordV5 {
                        cursor: 1,
                        record: CommonSyncRecordV5::test(),
                    }],
                };
                let pull_central = current_status.pull_central.unwrap();

                let response_record = match iteration {
                    0 => {
                        let prepare_initial = current_status.prepare_initial.unwrap();
                        assert_between!(prepare_initial.finished.unwrap(), previous_datetime, now);
                        assert_between!(pull_central.started, previous_datetime, now);
                        assert!(pull_central.finished.is_none());

                        assert_eq!(pull_central.done, None);
                        assert_eq!(pull_central.total, None);

                        response_record.data[0].cursor = 1;
                        response_record
                    }
                    1 => {
                        assert_eq!(pull_central.done, Some(1));
                        assert_eq!(pull_central.total, Some(3));

                        response_record.data[0].cursor = 2;
                        response_record
                    }
                    2 => {
                        assert_eq!(pull_central.done, Some(2));
                        assert_eq!(pull_central.total, Some(3));

                        response_record.data[0].cursor = 3;
                        response_record
                    }
                    3 => {
                        assert_eq!(pull_central.done, Some(3));
                        assert_eq!(pull_central.total, Some(3));

                        response_record.data = vec![];
                        response_record
                    }
                    _ => unreachable!("Problem in test, too many central data requests"),
                };

                TestOutput {
                    new_status,
                    response: serde_json::to_string(&response_record).unwrap(),
                }
            },
        )
        .add_test(
            "queued_records",
            |TestInput {
                 previous_status,
                 current_status,
                 previous_datetime,
                 now,
                 iteration,
             }| {
                let new_status = inline_edit(&previous_status, |mut r| {
                    if iteration == 0 {
                        r.pull_central = current_status.pull_central.clone()
                    }
                    r.pull_remote = current_status.pull_remote.clone();
                    r
                });
                assert_eq!(current_status, new_status);

                let mut response_record = RemoteSyncBatchV5 {
                    queue_length: 3,
                    data: vec![RemoteSyncRecordV5 {
                        sync_id: "".to_string(),
                        record: CommonSyncRecordV5::test(),
                    }],
                };
                let pull_remote = current_status.pull_remote.unwrap();

                let response_record = match iteration {
                    0 => {
                        let pull_central = current_status.pull_central.unwrap();
                        assert_between!(pull_central.finished.unwrap(), previous_datetime, now);
                        assert_between!(pull_remote.started, previous_datetime, now);
                        assert!(pull_remote.finished.is_none());

                        assert_eq!(pull_remote.done, None);
                        assert_eq!(pull_remote.total, None);

                        response_record.queue_length = 3;
                        response_record
                    }
                    1 => {
                        assert_eq!(pull_remote.done, Some(1));
                        assert_eq!(pull_remote.total, Some(3));

                        response_record.queue_length = 2;
                        response_record
                    }
                    2 => {
                        assert_eq!(pull_remote.done, Some(2));
                        assert_eq!(pull_remote.total, Some(3));

                        response_record.queue_length = 1;
                        response_record
                    }
                    3 => {
                        assert_eq!(pull_remote.done, Some(3));
                        assert_eq!(pull_remote.total, Some(3));

                        response_record.queue_length = 0;
                        response_record.data = vec![];
                        response_record
                    }
                    _ => unreachable!("Problem in test, too many central data requests"),
                };

                TestOutput {
                    new_status,
                    response: serde_json::to_string(&response_record).unwrap(),
                }
            },
        )
        .add_test("acknowledged_records", |ctx| TestOutput {
            new_status: ctx.current_status,
            response: r#"{"syncIDs":[]}"#.to_string(),
        })
        .add_test("site", |ctx| TestOutput {
            new_status: ctx.current_status,
            response: r#"{"id":"abc123","siteId": 123}"#.to_string(),
        })
        .add_test(
            "final",
            |TestInput {
                 previous_status,
                 current_status,
                 previous_datetime,
                 now,
                 ..
             }| {
                let new_status = inline_edit(&previous_status, |mut r| {
                    r.is_syncing = false;
                    r.summary = current_status.summary.clone();
                    r.pull_remote = current_status.pull_remote.clone();
                    r.integration = current_status.integration.clone();
                    r
                });

                assert_eq!(current_status, new_status);

                assert_between!(
                    current_status.summary.finished.unwrap(),
                    previous_datetime,
                    now
                );

                let pull_remote = current_status.pull_remote.unwrap();
                let pull_remote_finished = pull_remote.finished.unwrap();

                assert_between!(pull_remote_finished, pull_remote.started, now);

                let integration = current_status.integration.unwrap();
                assert_between!(integration.started, pull_remote_finished, now);
                assert_between!(integration.finished.unwrap(), integration.started, now);

                TestOutput {
                    new_status,
                    response: String::new(),
                }
            },
        )
}

/// Mount routes required for push and error test, checking sync status in each route
/// * /queued_records
/// * /site_status
/// * /central_records (returns an error)
/// * /final (manually called as last step)
fn get_push_and_error_sync_status_tester(service_provider: Arc<ServiceProvider>) -> Tester {
    Tester::new(service_provider.clone())
        .add_test(
            "queued_records",
            |TestInput {
                 previous_status,
                 current_status,
                 previous_datetime,
                 now,
                 iteration,
             }| {
                let new_status = inline_edit(&previous_status, |mut r| {
                    if iteration == 0 {
                        r.is_syncing = true;
                        r.summary = current_status.summary.clone();
                    }
                    // Even though prepare_initial is not run, it is logged
                    r.prepare_initial = current_status.prepare_initial.clone();
                    r.push = current_status.push.clone();
                    r
                });
                assert_eq!(current_status, new_status);
                let push_status = current_status.push.unwrap();

                let integration_started = match iteration {
                    0 => {
                        assert_between!(current_status.summary.started, previous_datetime, now);
                        assert_between!(push_status.started, previous_datetime, now);
                        assert!(push_status.finished.is_none());

                        assert_eq!(push_status.done, Some(0));
                        assert_eq!(push_status.total, Some(3));

                        false
                    }
                    1 => {
                        assert_eq!(push_status.done, Some(1));
                        assert_eq!(push_status.total, Some(3));

                        false
                    }
                    2 => {
                        assert_eq!(push_status.done, Some(2));
                        assert_eq!(push_status.total, Some(3));

                        false
                    }
                    3 => {
                        assert_eq!(push_status.done, Some(3));
                        assert_eq!(push_status.total, Some(3));

                        true
                    }
                    _ => unreachable!("Problem in test, too many central data requests"),
                };

                let response_record = RemotePushResponseV5 {
                    integration_started,
                };

                TestOutput {
                    new_status,
                    response: serde_json::to_string(&response_record).unwrap(),
                }
            },
        )
        .add_test("site_status", |ctx| {
            let response_record = SiteStatusV5 {
                code: SiteStatusCodeV5::Idle,
                message: String::new(),
                data: None,
            };
            TestOutput {
                new_status: ctx.current_status,
                response: serde_json::to_string(&response_record).unwrap(),
            }
        })
        .add_test(
            "central_records",
            |TestInput {
                 previous_status,
                 current_status,
                 previous_datetime,
                 now,
                 ..
             }| {
                let new_status = inline_edit(&previous_status, |mut r| {
                    r.push = current_status.push.clone();
                    r.pull_central = current_status.pull_central.clone();
                    r
                });
                assert_eq!(current_status, new_status);

                let push_status = current_status.push.unwrap();
                assert_between!(push_status.finished.unwrap(), previous_datetime, now);

                TestOutput {
                    new_status,
                    response: r#"invalid"#.to_string(),
                }
            },
        )
        .add_test(
            "final",
            |TestInput {
                 previous_status,
                 current_status,
                 ..
             }| {
                let new_status = inline_edit(&previous_status, |mut r| {
                    r.is_syncing = false;
                    r.error = current_status.error.clone();
                    r
                });
                assert_eq!(current_status, new_status);
                util::assert_matches!(current_status.error, Some(SyncLogError { .. }));

                TestOutput {
                    new_status,
                    response: String::new(),
                }
            },
        )
}

/// Create synchroniser and server and run, returning synchroniser result
async fn run_server_and_sync(
    service_provider: Arc<ServiceProvider>,
    tester_data: TesterData,
    port: u16,
) -> Result<(), SyncError> {
    let sync_settings = SyncSettings {
        url: format!("http://127.0.0.1:{}", port),
        username: "".to_string(),
        password_sha256: "".to_string(),
        interval_seconds: 100000,
        batch_size: BatchSize {
            remote_pull: 1,
            remote_push: 1,
            central_pull: 1,
        },
    };

    let synchroniser =
        Synchroniser::new(sync_settings.clone(), service_provider.clone().into()).unwrap();

    async fn entry(path: web::Path<String>, tester: TesterData) -> String {
        tester.lock().await.try_route(path.to_string())
    }

    let server = HttpServer::new(move || {
        App::new()
            .app_data(tester_data.clone())
            .route("/sync/v5/{route}", web::to(entry))
    })
    .bind(("127.0.0.1", port))
    .unwrap();

    let server_future = server.run();
    let server_handle = server_future.handle();
    let result = tokio::select! {
        _ = server_future => unreachable!("Sync should finish first"),
        result = synchroniser.sync() => result
    };

    server_handle.stop(true).await;

    result
}

#[derive(Debug)]
struct TestInput {
    now: NaiveDateTime,
    /// Timestamps of previously called route
    previous_datetime: NaiveDateTime,
    /// Status returned by previously called route
    previous_status: FullSyncStatus,
    /// Current status from database
    current_status: FullSyncStatus,
    /// Iteration for a route
    iteration: u32,
}

struct TestOutput {
    /// Status to be passed on to next route
    new_status: FullSyncStatus,
    response: String,
}

type TesterData = Data<Mutex<Tester>>;

/// Helper struct for defining mock server routes and tests withing routes
struct Tester {
    service_provider: Arc<ServiceProvider>,
    previous_status: FullSyncStatus,
    previous_date: NaiveDateTime,
    iterations: HashMap<String, u32>,
    tests: HashMap<String, fn(TestInput) -> TestOutput>,
}

impl Tester {
    fn new(service_provider: Arc<ServiceProvider>) -> Self {
        Tester {
            service_provider,
            previous_status: Default::default(),
            iterations: HashMap::new(),
            tests: HashMap::new(),
            previous_date: Utc::now().naive_utc(),
        }
    }

    fn add_test(mut self, route: &str, test: fn(TestInput) -> TestOutput) -> Self {
        self.tests.insert(route.to_string(), test);
        self
    }

    /// Tries to match route, provides TestInput for each route, keeps track of iterationa and status
    fn try_route(&mut self, route: String) -> String {
        let test = match self.tests.get(&route) {
            Some(test) => test,
            None => unreachable!("Could not match route ({})", route),
        };

        let ctx = self.service_provider.basic_context().unwrap();

        let iteration = self.iterations.entry(route.clone()).or_insert(0);

        let now = Utc::now().naive_utc();

        let input = TestInput {
            now,
            current_status: self
                .service_provider
                .sync_status_service
                .get_latest_sync_status(&ctx)
                .unwrap()
                .unwrap(),
            previous_status: self.previous_status.clone(),
            iteration: *iteration,
            previous_datetime: self.previous_date,
        };

        let TestOutput {
            new_status,
            response,
        } = test(input);

        self.previous_status = new_status;
        self.previous_date = now;
        *iteration += 1;

        response
    }
}
