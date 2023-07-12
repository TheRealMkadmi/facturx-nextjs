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
          textGradient: "45deg, $blue600 -20%, $pink600 50%",
        }}
        weight="bold"
      >
        Invoice Parser
      </Text>
      <Spacer y={3} />
      <Row gap={1}>
        <Col span={4}>
          <UploadCard />
        </Col>
        <Col span={8}>
          <InvoiceList />
        </Col>
      </Row>
    </Container>
  );
}
