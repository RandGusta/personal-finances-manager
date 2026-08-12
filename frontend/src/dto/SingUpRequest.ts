export interface SingUpRequest{
    email: string;
    password: string;
    name: string;
}

export interface SignUpResponse {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}
