
export interface User {
    login: string;
    password: string;
    name: string;
    role: string;
}

export interface Product {
    code: string;
    title: string;
    description: string;
    price: number;
    count: number;
    sold: number;
}

export interface OrderItem {
    count: number;
    product: Product;
}

export interface Order {
    items: OrderItem[];
    count: number;
    price: number;
    timestamp?: string;
}
