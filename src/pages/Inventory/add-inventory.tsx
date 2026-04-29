import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function AddInventory() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Inventory</h1>
                    <p className="text-sm text-muted-foreground">Add new items to your stock.</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                    <CardDescription>Enter the details for the new inventory item.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="rounded-md border p-8 text-center text-muted-foreground">
                            Form inputs will go here.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}