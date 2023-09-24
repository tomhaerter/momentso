package app

import (
	"log"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"

	"github.com/openmomentso/momentso/pkg/ai"
	"github.com/openmomentso/momentso/pkg/app/auth"
	"github.com/openmomentso/momentso/pkg/database"
	"github.com/openmomentso/momentso/pkg/email"
	"github.com/openmomentso/momentso/pkg/graph"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Dependencies struct {
	DB   *database.Db
	Mail *email.Mail
	AI   *ai.AI
}

func StartApp(deps Dependencies) {

	dbI := database.NewClient()
	defer dbI.Db.Close()

	e := echo.New()
	e.Use(middleware.CORS())
	e.Use(middleware.Recover())
	e.Use(auth.Middleware(dbI))

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		DB:   deps.DB,
		Mail: deps.Mail,
	}}))

	e.GET("/", echo.WrapHandler(playground.Handler("GraphQL playground", "/graphql")))
	e.Any("/graphql", echo.WrapHandler(srv))
	e.GET("/healthz", func(c echo.Context) error {
		return c.JSON(200, "OK")
	})

	log.Printf("connect to http://localhost:8080/ for GraphQL playground")
	log.Fatal(e.Start(":8080"))
}
