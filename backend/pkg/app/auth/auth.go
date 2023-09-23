package auth

import (
	"context"

	"github.com/labstack/echo/v4"

	"github.com/openmomentso/momentso/pkg/database"
	"github.com/openmomentso/momentso/pkg/database/db"
)

type ctxKey string

var userCtxKey = ctxKey("user")

func Middleware(db *database.Db) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			token := c.Request().Header.Get("authorization")
			if token != "" {
				user, err := db.UserFindBySession(c.Request().Context(), token)
				if err != nil {
					return c.JSON(401, "unauthorized")
				}

				ctx := c.Request().Context()
				ctx = context.WithValue(ctx, userCtxKey, user)
				c.SetRequest(c.Request().WithContext(ctx))
			}

			return next(c)
		}
	}
}

func UserForCtx(ctx context.Context) (db.User, bool) {
	raw, ok := ctx.Value(userCtxKey).(db.User)
	return raw, ok
}
