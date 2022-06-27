CREATE TYPE log_type AS ENUM (
    'USER_LOGGED_IN',
    'INVOICE_CREATED',
    'INVOICE_STATUS_ALLOCATED',
    'INVOICE_STATUS_PICKED',
    'INVOICE_STATUS_SHIPPED',
    'INVOICE_STATUS_DELIVERED',
    'INVOICE_STATUS_VERIFIED'
);

CREATE TABLE log (
    id TEXT NOT NULL PRIMARY KEY,
    type log_type, 
    user_id TEXT,
    store_id TEXT REFERENCES store(id),
    record_id TEXT REFERENCES invoice(id),
    datetime TIMESTAMP NOT NULL
)