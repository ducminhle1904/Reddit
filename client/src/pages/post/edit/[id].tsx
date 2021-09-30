import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import {
  UpdatePostInput,
  useMeQuery,
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import NextLink from "next/link";
import { Form, Formik } from "formik";
import InputField from "../../../components/InputField";

function PostEdit() {
  const router = useRouter();
  const postId = router.query.id as string;
  const { data: meData, loading: meLoading } = useMeQuery();
  const { data: postData, loading: postLoading } = usePostQuery({
    variables: { id: postId },
  });
  const [updatePost, _] = useUpdatePostMutation();

  const onUpdatePostSubmit = async (values: Omit<UpdatePostInput, "id">) => {
    await updatePost({
      variables: {
        updatePostInput: {
          id: postId,
          ...values,
        },
      },
    });
    router.back();
  };

  if (meLoading || postLoading)
    return (
      <Layout>
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      </Layout>
    );

  if (!postData?.post)
    return (
      <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Post not found</AlertTitle>
        </Alert>
        <Box mt={4}>
          <NextLink href="/">
            <Button>Back to Homepage</Button>
          </NextLink>
        </Box>
      </Layout>
    );

  if (
    !meLoading &&
    !postLoading &&
    meData?.me?.id !== postData?.post?.userId.toString()
  )
    return (
      <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Unauthorized</AlertTitle>
        </Alert>
        <Box>
          <NextLink href="/">
            <Button>Back to Homepage</Button>
          </NextLink>
        </Box>
      </Layout>
    );

  const initialValues = {
    title: postData.post.title,
    text: postData.post.text,
  };

  return (
    <Layout>
      <Formik initialValues={initialValues} onSubmit={onUpdatePostSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Title"
              label="Title"
              type="text"
            />

            <InputField
              textarea
              name="text"
              placeholder="Text"
              label="Text"
              type="textarea"
            />
            <Flex justifyContent="space-between" alignItems="center">
              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Update post
              </Button>
              <NextLink href="/">
                <Button>Back to homepage</Button>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}

export default PostEdit;
