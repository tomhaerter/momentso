export interface AnthropicAPIResponse<TData> {
  data: TData[]
  hasMore: boolean
  nextPage: string | null
}
