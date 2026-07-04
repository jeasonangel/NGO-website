export interface Geography {
  code: string;
  name: string;
  level: string;
  population?: number;
}

export interface Indicator {
  code: string;
  name: string;
  unit: string;
  category: string;
}

export interface DataValue {
  geography_code: string;
  geography_name: string;
  geography_level: string;
  indicator_name: string;
  unit: string;
  year: number;
  value: number;
}

export interface ApiResponse<T> {
  data: T;
}