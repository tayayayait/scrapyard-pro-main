import { Order, Vehicle } from "@/types";

export interface MatchResult {
    orderId: string;
    matched: boolean;
    matchDetails?: string;
}

export function findMatchesForVehicle(vehicle: Vehicle, orders: Order[]): MatchResult[] {
    const results: MatchResult[] = [];

    // Filter only pending or partial matching orders
    const activeOrders = orders.filter(o => o.status === "대기중" || o.status === "부분매칭");

    for (const order of activeOrders) {
        // Simple matching logic:
        // Check if Order Part Name matches Vehicle Engine or Catalyst
        // In a real app, we would have standardized part codes.
        // Here we use string inclusion.

        let isMatch = false;
        let details = "";

        // 1. Catalyst Match
        if (order.partName.includes("촉매") && vehicle.catalystGrade) {
            // Assume order wants specific grade? or just any catalyst. 
            // For prototype: any catalyst vehicle matches '촉매' order
            isMatch = true;
            details = `촉매 (${vehicle.catalystGrade}) 매칭됨`;
        }

        // 2. Engine Match
        // If order mentions "엔진" or "ECU" and vehicle engine matches
        if ((order.partName.includes("엔진") || order.partName.includes("ECU")) && vehicle.engineType) {
            // Check fuzzy match on engine type
            // e.g. Order: "2.0 가솔린", Vehicle: "2.0 가솔린"
            // Order: "ECU (현대)", Vehicle Model: "현대"
            if (vehicle.engineType.includes("2.0") && order.partName.includes("2.0")) {
                isMatch = true;
                details = "2.0 엔진 부품 매칭";
            }
            else if (vehicle.vehicleModel.includes("현대") || vehicle.vehicleModel.includes("기아")) {
                if (order.partName.includes("현대") || order.partName.includes("기아")) {
                    isMatch = true;
                    details = "호환 차종 부품 매칭";
                }
            }
        }

        if (isMatch) {
            results.push({
                orderId: order.id,
                matched: true,
                matchDetails: details
            });
        }
    }

    return results;
}
