package ai

import (
	"context"
	"errors"

	openai "github.com/sashabaranov/go-openai"
)

const System = "Write a morning recap poem for a user. The message must be motivating and positive. End with a motivational quote for today."
const Prompt = "\"%s\"\n\n%s"

type Config struct {
	Key string `env:"OPENAI_KEY"`
}

type AI struct {
	client *openai.Client
}

func New(cfg Config) *AI {
	client := openai.NewClient(cfg.Key)

	return &AI{
		client: client,
	}
}

type Entry struct {
	From        string
	To          string
	Description string
}

func (a *AI) GenerateMorningRecap(ctx context.Context, name string, entries []Entry) (string, error) {
	prompt := name + "\n\n"

	for _, entry := range entries {
		prompt += entry.From + "-" + entry.To + ": " + entry.Description + "\n"
	}

	resp, err := a.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		Messages: []openai.ChatCompletionMessage{
			{Role: "system", Content: System},
			{Role: "user", Content: prompt},
		},
		MaxTokens: 1000,
	})
	if err != nil {
		return "", err
	}

	if len(resp.Choices) != 1 {
		return "", errors.New("unexpected number of choices")
	}

	return resp.Choices[0].Message.Content, nil
}
