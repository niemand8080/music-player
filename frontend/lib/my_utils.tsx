import { logOut } from "@/components/provider/user-provider";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

export const findLogin = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/protected",
      {
        withCredentials: true,
      }
    );
    if (response.data.success) {
      toast({
        variant: "destructive",
        title: "You are already loged in",
        description: "By switching accounts your current account will be logged out",
        action: (
          <ToastAction altText="Logout" onClick={logOut}>
            Logout
          </ToastAction>
        ),
      });
      return true
    }
  } catch (error) {
    console.error("Error: " + error);
  }
  return false
};