import { Button, Flex, Spinner, useToast } from "@chakra-ui/react";
import { Formik, Form, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";

import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../utils/useCheckAuth";

function Register() {
  const router = useRouter();
  const toast = useToast();
  const { data: authData, loading: authLoading } = useCheckAuth();

  const initialValues: RegisterInput = {
    username: "",
    email: "",
    password: "",
  };

  const [registerUser, { loading: _registerUserLoading, error }] =
    useRegisterMutation();

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        if (data?.register.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.register.user },
          });
        }
      },
    });

    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register.user) {
      // register successfully
      toast({
        position: "top-right",
        title: "Welcome",
        description: `${response.data.register.user.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/");
    }
  };
  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      ) : (
        <Wrapper size="small">
          {error && <p>Failed to register</p>}

          <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="username"
                  placeholder="Username"
                  label="Username"
                  type="text"
                />

                <InputField
                  name="email"
                  placeholder="Email"
                  label="Email"
                  type="text"
                />

                <InputField
                  name="password"
                  placeholder="Password"
                  label="Password"
                  type="password"
                />

                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  );
}

export default Register;
