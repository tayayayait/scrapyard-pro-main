import React, { createContext, useContext, useEffect, useMemo, useReducer, ReactNode } from "react";
import {
    AuditLog,
    BidStage,
    CurrentUser,
    InventoryItem,
    Location,
    MatchEvent,
    Order,
    OrderStatus,
    PricingRule,
    User,
    Vehicle,
    VehicleStatus,
} from "@/types";
import { loadState, saveState } from "@/lib/storage";

interface AppState {
    vehicles: Vehicle[];
    orders: Order[];
    pricingRules: PricingRule[];
    inventory: InventoryItem[];
    locations: Location[];
    matchEvents: MatchEvent[];
    auditLogs: AuditLog[];
    users: User[];
    currentUser: CurrentUser;
}

interface DataContextType extends AppState {
    replaceState: (nextState: AppState) => void;
    addVehicle: (vehicle: Vehicle) => void;
    updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
    setVehicleStatus: (id: string, status: VehicleStatus) => void;
    setVehicleStage: (id: string, stage: BidStage) => void;
    addOrder: (order: Order) => void;
    updateOrder: (id: string, updates: Partial<Order>) => void;
    setOrderStatus: (id: string, status: OrderStatus) => void;
    appendMatchedVehicle: (orderId: string, vehicleNumber: string) => void;
    addPricingRule: (rule: PricingRule) => void;
    updatePricingRule: (id: string, updates: Partial<PricingRule>) => void;
    removePricingRule: (id: string) => void;
    addInventoryItem: (item: InventoryItem) => void;
    updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
    checkoutInventoryItem: (id: string, outboundDate?: string) => void;
    upsertLocation: (location: Location) => void;
    setLocations: (locations: Location[]) => void;
    appendAuditLog: (log: AuditLog) => void;
    appendMatchEvent: (event: MatchEvent) => void;
}

type Action =
    | { type: "REPLACE_STATE"; payload: AppState }
    | { type: "ADD_VEHICLE"; payload: Vehicle }
    | { type: "UPDATE_VEHICLE"; payload: { id: string; updates: Partial<Vehicle> } }
    | { type: "SET_VEHICLE_STATUS"; payload: { id: string; status: VehicleStatus } }
    | { type: "SET_VEHICLE_STAGE"; payload: { id: string; stage: BidStage } }
    | { type: "ADD_ORDER"; payload: Order }
    | { type: "UPDATE_ORDER"; payload: { id: string; updates: Partial<Order> } }
    | { type: "SET_ORDER_STATUS"; payload: { id: string; status: OrderStatus } }
    | { type: "APPEND_MATCHED_VEHICLE"; payload: { orderId: string; vehicleNumber: string } }
    | { type: "ADD_PRICING_RULE"; payload: PricingRule }
    | { type: "UPDATE_PRICING_RULE"; payload: { id: string; updates: Partial<PricingRule> } }
    | { type: "REMOVE_PRICING_RULE"; payload: { id: string } }
    | { type: "ADD_INVENTORY_ITEM"; payload: InventoryItem }
    | { type: "UPDATE_INVENTORY_ITEM"; payload: { id: string; updates: Partial<InventoryItem> } }
    | { type: "CHECKOUT_INVENTORY_ITEM"; payload: { id: string; outboundDate: string } }
    | { type: "UPSERT_LOCATION"; payload: Location }
    | { type: "SET_LOCATIONS"; payload: Location[] }
    | { type: "APPEND_AUDIT_LOG"; payload: AuditLog }
    | { type: "APPEND_MATCH_EVENT"; payload: MatchEvent };

const DataContext = createContext<DataContextType | undefined>(undefined);

function createSeedState(): AppState {
    const vehicles: Vehicle[] = [
        {
            id: "1",
            status: "작업중",
            vehicleNumber: "12가 3456",
            vehicleModel: "현대 그랜저 IG",
            year: "2019",
            engineType: "2.4 가솔린",
            catalystGrade: "A+",
            expectedPrice: 2850000,
            stage: "견적산정",
            updatedAt: "2024-01-15",
            progress: 60,
            assignee: "김철수",
            priority: "high",
            tasks: [
                { id: "t1", name: "외관 검사", completed: true },
                { id: "t2", name: "엔진룸 점검", completed: true },
                { id: "t3", name: "부품 분류", completed: false },
                { id: "t4", name: "사진 촬영", completed: false },
                { id: "t5", name: "최종 확인", completed: false },
            ],
        },
        {
            id: "2",
            status: "승인대기",
            vehicleNumber: "34나 7890",
            vehicleModel: "BMW 520d G30",
            year: "2020",
            engineType: "2.0 디젤",
            catalystGrade: "A",
            expectedPrice: 3200000,
            stage: "승인요청",
            updatedAt: "2024-01-15",
            progress: 0,
            assignee: "이영희",
            priority: "normal",
            tasks: [
                { id: "t1", name: "외관 검사", completed: false },
                { id: "t2", name: "엔진룸 점검", completed: false },
                { id: "t3", name: "부품 분류", completed: false },
                { id: "t4", name: "사진 촬영", completed: false },
                { id: "t5", name: "최종 확인", completed: false },
            ],
        },
        {
            id: "3",
            status: "낙찰",
            vehicleNumber: "56다 1234",
            vehicleModel: "기아 K5 DL3",
            year: "2021",
            engineType: "1.6 터보",
            catalystGrade: "B+",
            expectedPrice: 1980000,
            stage: "낙찰확정",
            updatedAt: "2024-01-14",
            progress: 100,
            assignee: "박지민",
            priority: "normal",
            tasks: [
                { id: "t1", name: "외관 검사", completed: true },
                { id: "t2", name: "엔진룸 점검", completed: true },
                { id: "t3", name: "부품 분류", completed: true },
                { id: "t4", name: "사진 촬영", completed: true },
                { id: "t5", name: "최종 확인", completed: true },
            ],
        },
        {
            id: "4",
            status: "패찰",
            vehicleNumber: "78라 5678",
            vehicleModel: "벤츠 E300 W213",
            year: "2018",
            engineType: "2.0 터보",
            catalystGrade: "A",
            expectedPrice: 4500000,
            stage: "입찰종료",
            updatedAt: "2024-01-14",
        },
        {
            id: "5",
            status: "입찰진행",
            vehicleNumber: "90마 9012",
            vehicleModel: "아우디 A6 C8",
            year: "2020",
            engineType: "2.0 TFSI",
            catalystGrade: "A+",
            expectedPrice: 3800000,
            stage: "견적완료",
            updatedAt: "2024-01-15",
        },
    ];

    const orders: Order[] = [
        {
            id: "ORD-2024-001",
            partName: "촉매 컨버터 (Rh 고함량)",
            requester: "A부품상사",
            quantity: 2,
            status: "매칭완료",
            matchedVehicles: ["12가 3456", "56다 1234"],
            priority: "high",
            createdAt: "2024-01-15",
            dueDate: "2024-01-20",
        },
        {
            id: "ORD-2024-002",
            partName: "ECU 모듈 (현대/기아)",
            requester: "B전자",
            quantity: 5,
            status: "부분매칭",
            matchedVehicles: ["34나 7890"],
            priority: "normal",
            createdAt: "2024-01-14",
            dueDate: "2024-01-22",
        },
        {
            id: "ORD-2024-003",
            partName: "자동변속기 어셈블리",
            requester: "C모터스",
            quantity: 1,
            status: "대기중",
            matchedVehicles: [],
            priority: "normal",
            createdAt: "2024-01-14",
            dueDate: "2024-01-25",
        },
        {
            id: "ORD-2024-004",
            partName: "에어컨 컴프레서",
            requester: "D공조",
            quantity: 3,
            status: "완료",
            matchedVehicles: ["78라 5678", "90마 9012", "23바 4567"],
            priority: "normal",
            createdAt: "2024-01-12",
            dueDate: "2024-01-18",
        },
    ];

    const pricingRules: PricingRule[] = [
        { id: "1", category: "차량제조사", name: "현대자동차", code: "HYUNDAI", status: "active", basePrice: 50000 },
        { id: "2", category: "차량제조사", name: "기아자동차", code: "KIA", status: "active", basePrice: 50000 },
        { id: "3", category: "촉매등급", name: "A+ (최상)", code: "GRADE_AP", status: "active", basePrice: 400000 },
        { id: "4", category: "촉매등급", name: "A (상)", code: "GRADE_A", status: "active", basePrice: 300000 },
        { id: "5", category: "부품분류", name: "엔진부품", code: "CAT_ENGINE", status: "active", basePrice: 0 },
    ];

    const locations: Location[] = [
        { id: "LOC-A1-01", label: "A1-01", capacity: 20, currentQty: 12, status: "partial" },
        { id: "LOC-A1-02", label: "A1-02", capacity: 15, currentQty: 0, status: "empty" },
        { id: "LOC-A2-01", label: "A2-01", capacity: 15, currentQty: 10, status: "partial" },
        { id: "LOC-A2-02", label: "A2-02", capacity: 10, currentQty: 10, status: "full" },
    ];

    const inventory: InventoryItem[] = [
        {
            id: "INV-001",
            partName: "촉매 컨버터",
            partType: "촉매",
            vehicleId: "1",
            vehicleNumber: "12가 3456",
            grade: "A+",
            locationId: "LOC-A1-01",
            locationLabel: "A1-01",
            status: "재고",
            quantity: 1,
            inboundDate: "2024-01-15",
        },
        {
            id: "INV-002",
            partName: "ECU 모듈",
            partType: "기타",
            vehicleId: "2",
            vehicleNumber: "34나 7890",
            grade: "A",
            locationId: "LOC-A1-02",
            locationLabel: "A1-02",
            status: "예약됨",
            quantity: 1,
            inboundDate: "2024-01-14",
        },
        {
            id: "INV-003",
            partName: "자동변속기",
            partType: "기타",
            vehicleId: "3",
            vehicleNumber: "56다 1234",
            grade: "B+",
            locationId: "LOC-A2-01",
            locationLabel: "A2-01",
            status: "출고대기",
            quantity: 1,
            inboundDate: "2024-01-13",
        },
    ];

    const users: User[] = [
        { id: "user-1", name: "김철수", email: "kim@example.com", role: "admin", status: "active" },
        { id: "user-2", name: "이영희", email: "lee@example.com", role: "manager", status: "active" },
        { id: "user-3", name: "박지민", email: "park@example.com", role: "staff", status: "active" },
    ];

    const currentUser: CurrentUser = {
        id: "user-1",
        role: "admin",
        name: "김철수",
    };

    return {
        vehicles,
        orders,
        pricingRules,
        inventory,
        locations,
        matchEvents: [],
        auditLogs: [],
        users,
        currentUser,
    };
}

function updateById<T extends { id: string }>(items: T[], id: string, updates: Partial<T>): T[] {
    return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "REPLACE_STATE":
            return action.payload;
        case "ADD_VEHICLE":
            return { ...state, vehicles: [action.payload, ...state.vehicles] };
        case "UPDATE_VEHICLE":
            return { ...state, vehicles: updateById(state.vehicles, action.payload.id, action.payload.updates) };
        case "SET_VEHICLE_STATUS":
            return { ...state, vehicles: updateById(state.vehicles, action.payload.id, { status: action.payload.status }) };
        case "SET_VEHICLE_STAGE":
            return { ...state, vehicles: updateById(state.vehicles, action.payload.id, { stage: action.payload.stage }) };
        case "ADD_ORDER":
            return { ...state, orders: [action.payload, ...state.orders] };
        case "UPDATE_ORDER":
            return { ...state, orders: updateById(state.orders, action.payload.id, action.payload.updates) };
        case "SET_ORDER_STATUS":
            return { ...state, orders: updateById(state.orders, action.payload.id, { status: action.payload.status }) };
        case "APPEND_MATCHED_VEHICLE": {
            const { orderId, vehicleNumber } = action.payload;
            return {
                ...state,
                orders: state.orders.map((order) => {
                    if (order.id !== orderId) return order;
                    if (order.status === "완료") return order;
                    const existing = new Set(order.matchedVehicles);
                    existing.add(vehicleNumber);
                    const matchedVehicles = Array.from(existing);
                    const nextStatus =
                        matchedVehicles.length >= order.quantity ? "매칭완료" : matchedVehicles.length > 0 ? "부분매칭" : "대기중";
                    return { ...order, matchedVehicles, status: nextStatus };
                }),
            };
        }
        case "ADD_PRICING_RULE":
            return { ...state, pricingRules: [action.payload, ...state.pricingRules] };
        case "UPDATE_PRICING_RULE":
            return { ...state, pricingRules: updateById(state.pricingRules, action.payload.id, action.payload.updates) };
        case "REMOVE_PRICING_RULE":
            return { ...state, pricingRules: state.pricingRules.filter((rule) => rule.id !== action.payload.id) };
        case "ADD_INVENTORY_ITEM":
            return { ...state, inventory: [action.payload, ...state.inventory] };
        case "UPDATE_INVENTORY_ITEM":
            return { ...state, inventory: updateById(state.inventory, action.payload.id, action.payload.updates) };
        case "CHECKOUT_INVENTORY_ITEM":
            return {
                ...state,
                inventory: updateById(state.inventory, action.payload.id, {
                    status: "출고완료",
                    outboundDate: action.payload.outboundDate,
                }),
            };
        case "UPSERT_LOCATION": {
            const exists = state.locations.some((loc) => loc.id === action.payload.id);
            return {
                ...state,
                locations: exists
                    ? updateById(state.locations, action.payload.id, action.payload)
                    : [action.payload, ...state.locations],
            };
        }
        case "SET_LOCATIONS":
            return { ...state, locations: action.payload };
        case "APPEND_AUDIT_LOG":
            return { ...state, auditLogs: [action.payload, ...state.auditLogs] };
        case "APPEND_MATCH_EVENT":
            return { ...state, matchEvents: [action.payload, ...state.matchEvents] };
        default:
            return state;
    }
}

function getInitialState(): AppState {
    const stored = loadState<AppState>();
    if (stored) return stored;
    return createSeedState();
}

export function DataProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

    useEffect(() => {
        saveState(state);
    }, [state]);

    const actions: Omit<DataContextType, keyof AppState> = useMemo(
        () => ({
            replaceState: (nextState) => dispatch({ type: "REPLACE_STATE", payload: nextState }),
            addVehicle: (vehicle) => dispatch({ type: "ADD_VEHICLE", payload: vehicle }),
            updateVehicle: (id, updates) => dispatch({ type: "UPDATE_VEHICLE", payload: { id, updates } }),
            setVehicleStatus: (id, status) => dispatch({ type: "SET_VEHICLE_STATUS", payload: { id, status } }),
            setVehicleStage: (id, stage) => dispatch({ type: "SET_VEHICLE_STAGE", payload: { id, stage } }),
            addOrder: (order) => dispatch({ type: "ADD_ORDER", payload: order }),
            updateOrder: (id, updates) => dispatch({ type: "UPDATE_ORDER", payload: { id, updates } }),
            setOrderStatus: (id, status) => dispatch({ type: "SET_ORDER_STATUS", payload: { id, status } }),
            appendMatchedVehicle: (orderId, vehicleNumber) =>
                dispatch({ type: "APPEND_MATCHED_VEHICLE", payload: { orderId, vehicleNumber } }),
            addPricingRule: (rule) => dispatch({ type: "ADD_PRICING_RULE", payload: rule }),
            updatePricingRule: (id, updates) => dispatch({ type: "UPDATE_PRICING_RULE", payload: { id, updates } }),
            removePricingRule: (id) => dispatch({ type: "REMOVE_PRICING_RULE", payload: { id } }),
            addInventoryItem: (item) => dispatch({ type: "ADD_INVENTORY_ITEM", payload: item }),
            updateInventoryItem: (id, updates) => dispatch({ type: "UPDATE_INVENTORY_ITEM", payload: { id, updates } }),
            checkoutInventoryItem: (id, outboundDate) =>
                dispatch({
                    type: "CHECKOUT_INVENTORY_ITEM",
                    payload: { id, outboundDate: outboundDate ?? new Date().toISOString().slice(0, 10) },
                }),
            upsertLocation: (location) => dispatch({ type: "UPSERT_LOCATION", payload: location }),
            setLocations: (locations) => dispatch({ type: "SET_LOCATIONS", payload: locations }),
            appendAuditLog: (log) => dispatch({ type: "APPEND_AUDIT_LOG", payload: log }),
            appendMatchEvent: (event) => dispatch({ type: "APPEND_MATCH_EVENT", payload: event }),
        }),
        []
    );

    const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}
