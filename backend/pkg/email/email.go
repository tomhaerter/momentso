package email

import (
	"net/smtp"
	"strconv"
	"strings"

	"github.com/jordan-wright/email"
	"github.com/matcornic/hermes/v2"
)

type Config struct {
	Host       string `env:"SMTP_HOST"`
	Port       int    `env:"SMTP_PORT"`
	Username   string `env:"SMTP_USERNAME"`
	Password   string `env:"SMTP_PASSWORD"`
	From       string `env:"SMTP_FROM"`
	AppBaseURL string `env:"APP_BASE_URL"`
}

type Mail struct {
	Cfg    Config
	Hermes hermes.Hermes
}

func New(cfg Config) *Mail {
	return &Mail{
		Cfg: cfg,
		Hermes: hermes.Hermes{
			Product: hermes.Product{
				Name:      "Momentso",
				Link:      "https://github.com/openmomentso/momentso",
				Logo:      "https://avatars.githubusercontent.com/u/145874591?s=48&v=4",
				Copyright: "Momentso",
			},
		},
	}
}

func (m *Mail) SendPasswordReset(name string, to string, token string) error {
	mail := hermes.Email{
		Body: hermes.Body{
			Name: name,
			Intros: []string{
				"You have received this email because a password reset request for your account was received.",
			},
			Actions: []hermes.Action{
				{
					Instructions: "Click the button below to reset your password:",
					Button: hermes.Button{
						Color: "#FF3A0F",
						Text:  "Reset Password",
						Link:  m.Cfg.AppBaseURL + "/reset-password?token=" + token,
					},
				},
			},
			Outros: []string{
				"If you did not request a password reset, no further action is required on your part.",
			},
		},
	}

	html, err := m.Hermes.GenerateHTML(mail)
	if err != nil {
		return err
	}

	text, err := m.Hermes.GeneratePlainText(mail)
	if err != nil {
		return err
	}

	e := email.NewEmail()
	e.From = m.Cfg.From
	e.To = []string{to}
	e.Subject = "Password Reset"
	e.HTML = []byte(html)
	e.Text = []byte(text)
	return e.Send(m.Cfg.Host+":"+strconv.Itoa(m.Cfg.Port), smtp.PlainAuth("", m.Cfg.Username, m.Cfg.Password, m.Cfg.Host))
}

func (m *Mail) SendMorningRecap(name, to, recap string) error {
	recap = strings.ReplaceAll(recap, "\n", "\n>")

	mail := hermes.Email{
		Body: hermes.Body{
			Name: name,
			Intros: []string{
				"Your morning recap is ready!",
			},

			FreeMarkdown: hermes.Markdown(">" + recap + ""),

			Outros: []string{
				"If you no longer wish to receive morning recaps, you can disable them in your account settings.",
			},
		},
	}

	html, err := m.Hermes.GenerateHTML(mail)
	if err != nil {
		return err
	}

	text, err := m.Hermes.GeneratePlainText(mail)
	if err != nil {
		return err
	}

	e := email.NewEmail()
	e.From = m.Cfg.From
	e.To = []string{to}
	e.Subject = "Your morning recap"
	e.HTML = []byte(html)
	e.Text = []byte(text)
	return e.Send(m.Cfg.Host+":"+strconv.Itoa(m.Cfg.Port), smtp.PlainAuth("", m.Cfg.Username, m.Cfg.Password, m.Cfg.Host))
}
