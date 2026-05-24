import "@stdlib/deploy";

contract FailureContract with Deployable {
    receive("fail") {
        // 1st outbound message
        send(SendParameters {
            to: sender(),
            value: ton("0.042"),
            mode: SendPayFwdFeesSeparately, // removed ignore errors to see it crash
        });
        // 2nd outbound message
        send(SendParameters {
            to: sender(),
            value: 0,
            mode: SendRemainingValue, // removed ignore errors
        });
    }

    receive("fail_dies") {
        emit("Have you seen this message?".asComment());
        send(SendParameters {
            to: sender(),
            value: 0,
            bounce: false,
            mode: SendRemainingValue,
        });
    }

    receive("fixed_1") {
        nativeReserve(ton("0.05"), ReserveAtMost | ReserveAddOriginalBalance);
        send(SendParameters {
            to: sender(),
            value: 0,
            mode: SendRemainingBalance,
        });
    }

    receive("fixed_2") {
        nativeReserve(ton("0.05"), ReserveAtMost | ReserveAddOriginalBalance);
        send(SendParameters {
            to: sender(),
            value: 0,
            mode: SendRemainingBalance,
        });
    }
}
