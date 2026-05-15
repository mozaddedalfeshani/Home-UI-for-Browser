export interface HistorySuggestion {
  id: string;
  type: "history";
  label: string;
  sublabel: string;
  value: string;
}

export interface TabSuggestion {
  id: string;
  type: "tab";
  tabId: string;
  label: string;
  sublabel: string;
  value: string;
  openInNewWindow?: boolean;
}

export interface ApiSuggestion {
  id: string;
  type: "api";
  label: string;
  value: string;
}

export type SuggestionItem = HistorySuggestion | TabSuggestion | ApiSuggestion;
