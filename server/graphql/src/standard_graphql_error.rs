use async_graphql::ErrorExtensions;
use repository::RepositoryError;
use service::{
    permission_validation::{ValidationDeniedKind, ValidationError},
    ListError,
};
use thiserror::Error;

#[derive(Debug, Error, Clone)]
pub enum StandardGraphqlError {
    #[error("Internal error")]
    InternalError(String),

    #[error("Bad user input")]
    BadUserInput(String),

    #[error("Unauthenticated")]
    Unauthenticated(String),

    #[error("Forbidden")]
    Forbidden(String),
}

impl ErrorExtensions for StandardGraphqlError {
    // lets define our base extensions
    fn extend(self) -> async_graphql::Error {
        async_graphql::Error::new(format!("{}", self)).extend_with(|_, e| match self {
            StandardGraphqlError::InternalError(details) => e.set("details", details),
            StandardGraphqlError::BadUserInput(details) => e.set("details", details),
            StandardGraphqlError::Unauthenticated(details) => e.set("details", details),
            StandardGraphqlError::Forbidden(details) => e.set("details", details),
        })
    }
}

impl From<RepositoryError> for StandardGraphqlError {
    fn from(err: RepositoryError) -> Self {
        StandardGraphqlError::InternalError(format!("{:?}", err))
    }
}

impl From<ValidationError> for StandardGraphqlError {
    fn from(err: ValidationError) -> Self {
        match err {
            ValidationError::Denied(kind) => match kind {
                ValidationDeniedKind::NotAuthenticated(_) => {
                    StandardGraphqlError::Unauthenticated(format!("{:?}", kind))
                }
                ValidationDeniedKind::InsufficientPermission(_) => {
                    StandardGraphqlError::Forbidden(format!("{:?}", kind))
                }
            },
            ValidationError::InternalError(err) => StandardGraphqlError::InternalError(err),
        }
    }
}

impl From<ListError> for StandardGraphqlError {
    fn from(err: ListError) -> Self {
        match err {
            ListError::DatabaseError(err) => err.into(),
            ListError::LimitBelowMin(_) => StandardGraphqlError::BadUserInput(format!("{:?}", err)),
            ListError::LimitAboveMax(_) => StandardGraphqlError::BadUserInput(format!("{:?}", err)),
        }
    }
}
