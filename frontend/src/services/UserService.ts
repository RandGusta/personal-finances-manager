import type { LoginRequest } from "../dto/LoginRequest";
import type { SingUpRequest } from "../dto/SingUpRequest";

export async function login(request: LoginRequest) {
    const response = await fetch("http://localhost:8081/login",{
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
            request
        )
    });

    if(!response.ok){
        const error = await response.json();
        throw new Error(error["message"]);
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
}


export async function singUp(request: SingUpRequest) {
    const response = await fetch("http://localhost:8081/signup", {
        method:  "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(request)
    });

    if(!response.ok){
        const error = await response.json();
        throw new Error(error["message"]);
    }
}

export async function getCurrentUserInform() {

    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8081/home", {
        method: "GET",
        headers : {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}`
        }
        }
    );

    if(!response.ok){
        const error = await response.json();
        throw new Error(error["message"]);
    }

    return await response.json()

}