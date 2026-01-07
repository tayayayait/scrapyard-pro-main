import { PricingRule, Vehicle } from "@/types";

export function calculatePrice(
    vehicle: Pick<Vehicle, "vehicleModel" | "year" | "engineType" | "catalystGrade">,
    pricingRules: PricingRule[]
): number {
    let basePrice = 1000000; // Default base price

    // 1. Find Catalyst Price
    // We match by the 'name' startsWith logic or code matching if possible.
    // Ideally, the vehicle's catalystGrade should match a PricingRule's name or code.
    // Current mock data: vehicle.catalystGrade = "A+", rule.name = "A+ (최상)".

    const gradeRule = pricingRules.find(r =>
        r.category === "촉매등급" &&
        (r.name.startsWith(vehicle.catalystGrade) || r.code === `GRADE_${vehicle.catalystGrade.replace('+', 'P')}`)
    );

    let catalystPrice = 0;
    if (gradeRule && gradeRule.basePrice) {
        catalystPrice = gradeRule.basePrice;
    } else {
        // Fallback for mock data if rule not found or no price
        if (vehicle.catalystGrade === "A+") catalystPrice = 400000;
        else if (vehicle.catalystGrade === "A") catalystPrice = 300000;
        else catalystPrice = 150000;
    }

    // 2. Engine Price
    if (vehicle.engineType.includes("2.0")) basePrice += 200000;
    if (vehicle.engineType.includes("3.0")) basePrice += 500000;
    if (vehicle.year >= "2020") basePrice += 500000;

    return basePrice + catalystPrice;
}
