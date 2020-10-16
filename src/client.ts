export type GetUsersByUserIdQueryParameters = {
  name?: string;
};

export interface ApiResponse<T> extends Response {
  json(): Promise<T>;
}
export type RequestFactoryType = (
  path: string,
  query: any,
  body: any,
  formData: any,
  headers: any,
  method: string,
  configuration: any
) => Promise<ApiResponse<any>>;

export class Ms1<T extends {} = {}> {
  constructor(
    protected configuration: T,
    protected requestFactory: RequestFactoryType
  ) {}
  GetUsersByUserId(
    userIdPathParameter: number,
    query: GetUsersByUserIdQueryParameters
  ): Promise<ApiResponse<any>> {
    let path = "/users/{userId}";
    path = path.replace("{userId}", String(userIdPathParameter));
    return this.requestFactory(
      path,
      query,
      undefined,
      undefined,
      undefined,
      "GET",
      this.configuration
    );
  }

  PostUsers(): Promise<ApiResponse<any>> {
    const path = "/users";
    return this.requestFactory(
      path,
      undefined,
      undefined,
      undefined,
      undefined,
      "POST",
      this.configuration
    );
  }
}
