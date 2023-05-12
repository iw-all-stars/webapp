import { extendTheme } from "@chakra-ui/react";
import { StepsTheme as Steps } from "chakra-ui-steps";

export const theme = extendTheme({
  components: {
    Steps,
  },
});

export default theme;
