# docker build -t kalabox/data-d7 .

FROM busybox

COPY data /data
RUN chmod 777 /data/files
RUN chmod a+x /data/scripts/*

VOLUME ["/data"]

CMD ["/bin/true"]
