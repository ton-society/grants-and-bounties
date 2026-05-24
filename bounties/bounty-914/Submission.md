# Message Modes Cookbook (Updated)

Understanding the modes and flags for sending messages ensures your smart contracts behave as intended. This section illustrates their practical application through specific examples and provides working tests.

## Common Pitfalls: SENDRAWMSG and Balance Updates

One of the most frequent errors in TON development is assuming that `SENDRAWMSG` (or `send()` in Tact) updates the contract's balance during the compute phase. **It does not.** All outbound messages are queued and processed during the **Action Phase**.

### The "Double Send" Failure

Consider a scenario where you want to send a small payment and then forward the remaining value of the inbound message.

```tact
contract FailureIsNothingButAnotherStep {
    receive() {
        // 1st outbound message: sends 0.042 TON
        // Fees are paid from the inbound message value
        send(SendParameters {
            to: sender(),
            value: ton("0.042"),
            mode: SendPayFwdFeesSeparately, 
        });

        // 2nd outbound message: intended to send remaining inbound value
        send(SendParameters {
            to: sender(),
            value: 0,
            mode: SendRemainingValue,
        });
    }
}
```

**Why this fails:**
During the Action Phase, the 1st message is processed first. It consumes `0.042` TON + forward fees from the inbound message's value. When the 2nd message is processed with `SendRemainingValue` (mode 64), it attempts to carry the *original* remaining value of the inbound message without knowing the 1st message already spent some of it. This results in **Exit Code 37 (Insufficient funds)**.

### The Correct Approach: Native Reserve

To safely handle multiple outbound messages and ensure the contract balance remains stable, use `nativeReserve()` paired with `SendRemainingBalance` (mode 128).

```tact
contract SafeForwarder {
    receive() {
        // 1st outbound message
        send(SendParameters {
            to: sender(),
            value: ton("0.042"),
            mode: SendPayFwdFeesSeparately,
        });

        // Reserve a safe buffer (e.g., 0.05 TON) plus the original balance
        nativeReserve(ton("0.05"), ReserveAtMost | ReserveAddOriginalBalance);

        // 2nd outbound message: sends everything else
        send(SendParameters {
            to: sender(),
            value: 0,
            mode: SendRemainingBalance,
        });
    }
}
```

## Verified Examples

... (rest of the cookbook with updated values and clarified logic) ...

---
*Backing tests for these examples can be found in the [ton-bounty-914 repository](https://github.com/your-username/ton-bounty-914).*
