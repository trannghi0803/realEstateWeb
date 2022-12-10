export enum Status {
    DELETED = -9,
    TRASH = -1,
    NEW = 0,
    ACTIVE = 1,
}

export enum HttpStatus {
    VALIDATION = 400,
    AUTHORIZE = 401,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500,
    SUCCESS = 200
}

export enum GeographicAddressType {
    Province = 0,
    District = 1,
    Ward = 2
}

export enum RealEstateType {
    Create = 1,
    Crawl = 2
}
export enum NewsType {
    Create = 1,
    Crawl = 2
}
export enum CategoryType {
    Sell = 0,
    Rent = 1
}

export enum IsHighLight {
    false = 0,
    True = 1
}

export enum RealEstateStatus {
    Reject = -2,
    Active = 1,
    Inactive = 0
}

export enum TimeExpressionType {
    Sell = 1,
    Rent = 2,
    News= 3
}