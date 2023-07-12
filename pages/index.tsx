import { Text, Spacer, useTheme, Col, Row, Container } from "@nextui-org/react";
import UploadCard from "@/components/UploadCard";
import InvoiceList from "@/components/InvoiceList";

export default function Home() {
  return (
    <Container gap={1}>
      <Spacer y={1} />
      <Text
        h2
        css={{
          textGradient: "45deg, $purple600 -20%, $pink600 100%",
          width: "fit-content",
          marginRight: "auto",
          marginLeft: "auto",
        }}
        weight="bold"
      >
        Invoice Parser
      </Text>
      <Spacer y={3} />
      <Row gap={1}>
        <Col className="">
          <UploadCard />
        </Col>
        <Col span={8}>
          <InvoiceList />
        </Col>
      </Row>
    </Container>
  );
}
