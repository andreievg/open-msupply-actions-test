
FROM rust:slim

RUN apt-get update && apt-get install -y faketime

WORKDIR /usr/src/omsupply/
# Copy executable
COPY server/target/release/remote_server .
COPY server/target/release/remote_server_cli .
# Copy entry
COPY docker/entry.sh .
# Copy reference file
COPY server/data data

WORKDIR /usr/src/omsupply/configuration
# Copy config
COPY server/configuration/base.yaml .
COPY docker/local.yaml .

# This is where machine_uid carate gets machine_uuid
RUN echo "test-uuid" > /etc/machine-id

# Create database dir
WORKDIR /database

WORKDIR /usr/src/omsupply/

RUN chmod +x remote_server
RUN chmod +x remote_server_cli
RUN chmod +x entry.sh

ENTRYPOINT ["/usr/src/omsupply/entry.sh"]

EXPOSE 8000