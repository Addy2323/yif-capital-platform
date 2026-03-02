import crypto from "crypto";

const SNIPPE_API_KEY = process.env.SNIPPE_API_KEY || "";
const SNIPPE_WEBHOOK_SECRET = process.env.SNIPPE_WEBHOOK_SECRET || "";
const SNIPPE_API_URL = "https://api.snippe.sh/v1";

interface SnippeCustomer {
    firstname: string;
    lastname: string;
    email: string;
}

interface SnippePaymentRequest {
    payment_type: "mobile";
    details: {
        amount: number;
        currency: string;
    };
    phone_number: string;
    customer: SnippeCustomer;
    webhook_url?: string;
    metadata?: any;
}

export class SnippeService {
    /**
     * Initiate a mobile money payment via Snippe API
     * Documentation: https://docs.snippe.sh/docs/2026-01-25/payments/mobile-money
     */
    static async initiatePayment(params: {
        userId: string;
        phone: string;
        amount: number;
        plan: string;
        description: string;
        customerEmail: string;
        customerName: string;
    }) {
        // Parse customer name into firstname and lastname
        const nameParts = params.customerName.trim().split(" ");
        const firstname = nameParts[0] || "Customer";
        const lastname = nameParts.slice(1).join(" ") || "User";

        // Ensure phone is in format 255XXXXXXXXX
        let formattedPhone = params.phone.replace(/\D/g, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "255" + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith("255")) {
            formattedPhone = "255" + formattedPhone;
        }

        const webhookUrl = `${process.env.NEXT_PUBLIC_PARENT_URL}/api/webhooks/snippe`;

        const payload: SnippePaymentRequest = {
            payment_type: "mobile",
            details: {
                amount: params.amount,
                currency: "TZS"
            },
            phone_number: formattedPhone,
            customer: {
                firstname,
                lastname,
                email: params.customerEmail
            },
            webhook_url: webhookUrl,
            metadata: {
                userId: params.userId,
                plan: params.plan,
                description: params.description
            }
        };

        try {
            console.log("Snippe Initiation Payload:", JSON.stringify(payload, null, 2));

            const response = await fetch(`${SNIPPE_API_URL}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SNIPPE_API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();
            console.log("Snippe API Raw Response:", responseText);

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Snippe API returned non-JSON response:", responseText);
                throw new Error(`Snippe API returned invalid response (Status: ${response.status})`);
            }

            if (!response.ok || data.status === "error") {
                throw new Error(data.message || data.error || `Snippe API error (Status: ${response.status})`);
            }

            return {
                success: true,
                transactionId: data.data?.reference || data.reference,
                reference: data.data?.reference || data.reference,
                message: "Payment initiated. Please check your phone for the prompt."
            };
        } catch (error) {
            console.error("Snippe Initiation Error:", error);
            throw new Error(`Failed to initiate Snippe payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Verify Snippe Webhook Signature
     */
    static verifySignature(payload: string, signature: string): boolean {
        if (!SNIPPE_WEBHOOK_SECRET || !signature) return false;

        // Snippe typically uses HMAC-SHA256 with the webhook secret
        const expectedSignature = crypto
            .createHmac("sha256", SNIPPE_WEBHOOK_SECRET)
            .update(payload)
            .digest("hex");

        return signature === expectedSignature;
    }
}
