FROM mariadb:latest

COPY ./gwangju.sql /docker-entrypoint-initdb.d/

RUN mkdir -p /var/lib/mysql /var/run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /var/run/mysqld

EXPOSE 3306