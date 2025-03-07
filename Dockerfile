
FROM rust:slim

WORKDIR /usr/src/omsupply/
# Copy executable
COPY server/target/release/remote_server .
COPY server/target/release/remote_server_cli .

WORKDIR /usr/src/omsupply/configuration
# Copy config
COPY server/configuration/base.yaml .
COPY docker/local.yaml .

# This is where machine_uid carate gets machine_uuid
RUN echo "test-uuid" > /etc/machine-id

WORKDIR /usr/src/omsupply/

RUN chmod +x remote_server
RUN chmod +x remote_server_cli

ENTRYPOINT /usr/src/omsupply/remote_server

EXPOSE 8000



