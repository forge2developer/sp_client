import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function InventoryListing() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Listing</h1>
                    <p className="text-sm text-muted-foreground">Manage and view your available stock.</p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Items</CardTitle>
                    <CardDescription>A complete list of your inventory items.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border p-8 text-center text-muted-foreground">
                        No items found.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}