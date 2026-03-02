import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Lightbulb } from "lucide-react"

interface PageInfoProps {
    useCase: string
    funFact: string
}

export function PageInfo({ useCase, funFact }: PageInfoProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card className="border-gold/20 bg-gold/5">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gold">
                        <Globe className="h-4 w-4" />
                        Tanzania Use Case
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{useCase}</p>
                </CardContent>
            </Card>
            <Card className="border-blue-500/20 bg-blue-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-500">
                        <Lightbulb className="h-4 w-4" />
                        Fun Fact
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{funFact}</p>
                </CardContent>
            </Card>
        </div>
    )
}
