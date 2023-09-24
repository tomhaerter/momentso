# syntax = docker/dockerfile:1.2

FROM golang:1.21-alpine3.18 as builder
ENV GO111MODULE=on

RUN mkdir -p /app/
WORKDIR /app
ADD go.mod .
ADD go.sum .
RUN go mod download

ADD . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -o app internal/cmd/cmd.go

FROM alpine as prod
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /app/
ENV GO_ENV=production
EXPOSE 8080

COPY --from=builder /app/app .

CMD /app/app app:start
