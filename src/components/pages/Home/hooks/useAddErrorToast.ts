import { Toast as BaseToast } from "@base-ui/react";
import { ToastType } from "@/components/base/Toast/Toast";

export const useAddErrorToast = () => {
    const toastManager = BaseToast.useToastManager();

    return (message: string) => {
        toastManager.add({
            title: "Error",
            description: message,
            type: ToastType.ERROR,
        });
    };
};
