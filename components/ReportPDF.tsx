"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { COMMITTEE_BY_ID } from "@/lib/committee";
import type { Brief, Rubric, Turn } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  h1: { fontSize: 26, marginBottom: 6, fontFamily: "Times-Roman" },
  sub: { fontSize: 9, color: "#666", marginBottom: 18, textTransform: "uppercase", letterSpacing: 1 },
  section: { marginBottom: 20 },
  label: { fontSize: 8, color: "#888", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 },
  overall: { fontSize: 48, fontFamily: "Times-Roman", marginBottom: 6 },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
  },
  scoreLabel: { fontSize: 10, flex: 1 },
  scoreNum: { fontSize: 14, fontFamily: "Times-Roman", width: 50, textAlign: "right" },
  justification: { fontSize: 9, color: "#555", flex: 2, paddingLeft: 12 },
  summary: { fontSize: 12, fontStyle: "italic", lineHeight: 1.5, marginBottom: 14 },
  note: { fontSize: 10, marginBottom: 6, lineHeight: 1.5 },
  turn: { marginBottom: 10 },
  turnLabel: { fontSize: 8, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  turnText: { fontSize: 10, lineHeight: 1.4 },
});

function Report({ brief, rubric, turns }: { brief: Brief; rubric: Rubric; turns: Turn[] }) {
  const rows: Array<[string, number, string]> = [
    ["Conviction Clarity", rubric.convictionClarity.score, rubric.convictionClarity.justification],
    ["Risk Acknowledgment", rubric.riskAck.score, rubric.riskAck.justification],
    ["Data Density", rubric.dataDensity.score, rubric.dataDensity.justification],
    ["Thesis Alignment", rubric.thesisAlignment.score, rubric.thesisAlignment.justification],
    ["Poise Under Pressure", rubric.poise.score, rubric.poise.justification],
  ];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.sub}>IC · SIM — Post-Committee Report</Text>
        <Text style={styles.h1}>{brief.company}</Text>
        <Text style={styles.sub}>
          {brief.sector} · {brief.stage} · {turns.length} turns
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Weighted Score</Text>
          <Text style={styles.overall}>{rubric.overall?.toFixed(1) ?? "—"} / 10</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Rubric</Text>
          {rows.map(([label, score, just]) => (
            <View key={label} style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{label}</Text>
              <Text style={styles.scoreNum}>{score} /10</Text>
              <Text style={styles.justification}>{just}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Summary</Text>
          <Text style={styles.summary}>{rubric.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Improvement Notes</Text>
          {rubric.improvementNotes?.map((note, i) => (
            <Text key={i} style={styles.note}>
              {i + 1}. {note}
            </Text>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.label}>Transcript</Text>
        {turns.map((t) => (
          <View key={t.id} style={styles.turn}>
            <Text style={styles.turnLabel}>
              {t.role === "presenter"
                ? "Presenter"
                : `${COMMITTEE_BY_ID[t.memberId!]?.archetype} — ${COMMITTEE_BY_ID[t.memberId!]?.name}`}
            </Text>
            <Text style={styles.turnText}>{t.text}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function PDFDownload({ brief, rubric, turns }: { brief: Brief; rubric: Rubric; turns: Turn[] }) {
  const filename = `ic-sim-${brief.company.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
  return (
    <PDFDownloadLink
      document={<Report brief={brief} rubric={rubric} turns={turns} />}
      fileName={filename}
      className="btn-solid"
    >
      {({ loading }) => (loading ? "Rendering…" : "Download PDF")}
    </PDFDownloadLink>
  );
}
