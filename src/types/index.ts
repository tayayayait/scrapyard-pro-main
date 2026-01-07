export type VehicleStatus = "입찰진행" | "승인대기" | "낙찰" | "패찰" | "작업중" | "대기" | "완료";
export type BidStage = "견적완료" | "승인요청" | "낙찰확정" | "입찰종료" | "견적산정";

export interface Vehicle {
    id: string;
    vehicleNumber: string;
    vehicleModel: string;
    year: string;
    engineType: string;
    catalystGrade: string;
    expectedPrice: number;
    status: VehicleStatus;
    stage: BidStage;
    updatedAt: string;
    // Field specific
    progress?: number;
    tasks?: Task[];
    assignee?: string;
    priority?: "normal" | "high";
}

export interface Task {
    id: string;
    name: string;
    completed: boolean;
}

export type OrderStatus = "대기중" | "부분매칭" | "매칭완료" | "완료";

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    "대기중": ["부분매칭", "매칭완료", "완료"],
    "부분매칭": ["매칭완료", "완료"],
    "매칭완료": ["완료"],
    "완료": [],
};

export interface Order {
    id: string;
    partName: string;
    requester: string;
    quantity: number;
    status: OrderStatus;
    matchedVehicles: string[];
    priority: "normal" | "high";
    createdAt: string;
    dueDate: string;
}

export interface PricingRule {
    id: string;
    category: string;
    name: string;
    code: string;
    status: "active" | "inactive";
    basePrice?: number;
}

export type InventoryStatus = "재고" | "예약됨" | "출고대기" | "출고완료" | "폐기";

export interface InventoryItem {
    id: string;
    partName: string;
    partType: "엔진" | "촉매" | "기타";
    vehicleId?: string;
    vehicleNumber?: string;
    grade?: string;
    locationId?: string;
    locationLabel?: string;
    status: InventoryStatus;
    quantity: number;
    inboundDate: string;
    outboundDate?: string;
    note?: string;
}

export type LocationStatus = "full" | "partial" | "empty" | "maintenance";

export interface Location {
    id: string;
    label: string;
    capacity: number;
    currentQty: number;
    status: LocationStatus;
    note?: string;
}

export interface MatchEvent {
    id: string;
    orderId: string;
    vehicleId?: string;
    inventoryItemId?: string;
    matchedAt: string;
    matchScore?: number;
    details?: string;
}

export interface AuditLog {
    id: string;
    actorId?: string;
    actorName?: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
    metadata?: Record<string, string | number | boolean | null>;
}

export type Role = "admin" | "manager" | "staff" | "viewer";

export interface User {
    id: string;
    name: string;
    email?: string;
    role: Role;
    status?: "active" | "inactive";
}

export interface CurrentUser {
    id: string;
    role: Role;
    name: string;
}
