import stripe from "../config/stripe.js";
import User from "../models/user.model.js";

export const stripeWebhook=async (req,res) => {
    console.log("WEBHOOK HIT", req.headers["stripe-signature"] ? "sig ok" : "no sig")
    const sig=req.headers["stripe-signature"]
    let event;
    try {
        event=stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        console.log("SIGNATURE ERROR:", error.message)
        return res.status(400).json({message:"webhook error"})
    }

    console.log("EVENT TYPE:", event.type)

    if(event.type=="checkout.session.completed"){
        const session=event.data.object
        console.log("METADATA:", session.metadata)
        const userId=session.metadata?.userId
        const credits=Number(session.metadata?.credits)
        const plan=session.metadata?.plan

        const updated = await User.findByIdAndUpdate(userId,{
            $inc:{credits},
            plan
        },{new:true})
        console.log("UPDATED USER:", updated?.email, updated?.credits)
    }

    return res.json({received:true})
}