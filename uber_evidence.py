from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

doc = SimpleDocTemplate(
    "/home/user/Phaora/Uber_Identity_Theft_Evidence.pdf",
    pagesize=letter,
    rightMargin=0.75*inch,
    leftMargin=0.75*inch,
    topMargin=0.75*inch,
    bottomMargin=0.75*inch
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=16, spaceAfter=6, textColor=colors.HexColor('#1a1a1a'))
heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=12, spaceAfter=4, textColor=colors.HexColor('#1a1a1a'), borderPad=4)
subheading_style = ParagraphStyle('SubHeading', parent=styles['Heading3'], fontSize=10, spaceAfter=3, textColor=colors.HexColor('#333333'))
body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9, spaceAfter=3, leading=13)
key_style = ParagraphStyle('Key', parent=styles['Normal'], fontSize=9, spaceAfter=3, leading=13, textColor=colors.HexColor('#8B0000'), fontName='Helvetica-Bold')
meta_style = ParagraphStyle('Meta', parent=styles['Normal'], fontSize=9, spaceAfter=2, textColor=colors.HexColor('#555555'), fontName='Helvetica-Oblique')

story = []

story.append(Paragraph("UBER IDENTITY THEFT — CHAT RECORD & EVIDENCE LOG", title_style))
story.append(HRFlowable(width="100%", thickness=2, color=colors.black))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("<b>Victim:</b> David", body_style))
story.append(Paragraph("<b>Date of Incident Documentation:</b> Sunday, June 21, 2026", body_style))
story.append(Paragraph("<b>Platform:</b> Uber Driver App — In-App Support Chat", body_style))
story.append(Paragraph("<b>Fraudulent Account Email:</b> davidm*******1@hotmail.com", body_style))
story.append(Spacer(1, 0.15*inch))

story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
story.append(Spacer(1, 0.1*inch))
story.append(Paragraph("TIMELINE OF EVENTS", heading_style))
story.append(Spacer(1, 0.05*inch))

screenshots = [
    {
        "id": "Screenshot 1 — IMG_8419",
        "time": "June 21, 2026 (morning, exact time not visible)",
        "agent": "Not yet identified",
        "summary": [
            "David initiates chat asking if his background check is being processed.",
            "Uber Support agent responds they will review and update shortly.",
            'Agent informs David: "In a recent review of your account, your account was identified as a duplicate of an account that was previously deactivated."',
        ],
        "admission": "Uber acknowledges the duplicate account flag on David's account."
    },
    {
        "id": "Screenshot 2 — IMG_8420",
        "time": "June 21, 2026",
        "agent": "Not yet identified",
        "summary": [
            'Uber instructs David to contact them from his "original account\'s email address at davidm*******1@hotmail.com"',
            'David responds: "No. This is my original account my..."',
        ],
        "admission": "Uber associates the email davidm*******1@hotmail.com with what they believe to be the \"original\" account — an account David did not create. This email belongs to the perpetrator.",
        "note": "This email does not belong to David. It belongs to the perpetrator."
    },
    {
        "id": "Screenshot 3 — IMG_8421",
        "time": "June 21, 2026",
        "agent": "Not yet identified",
        "summary": [
            'David clarifies: "No. This is my original account my friend."',
            'David requests: "Finish my background check please."',
            "Uber states his document is uploaded to the other account.",
            'David: "I just need background check for this one. I need it for this one."',
            "Uber asks David to confirm if he believes his identity was stolen.",
            'David: "I believe it was stolen."',
        ],
        "admission": "Uber directly asks David to confirm identity theft — acknowledging it as a plausible scenario."
    },
    {
        "id": "Screenshot 4 — IMG_8422",
        "time": "June 21, 2026",
        "agent": "Not yet identified",
        "summary": [
            'David confirms: "Yes. I believe it was stolen."',
            'Uber states: "Since this account is marked as a duplicate you will not be able to work with this account."',
            'Uber states: "And your background check will also not start on this account."',
            "David requests the other account be deleted and his account kept active.",
        ],
        "admission": "Uber explicitly confirms David cannot work and his background check cannot proceed due to the fraudulent duplicate account."
    },
    {
        "id": "Screenshot 5 — IMG_8423",
        "time": "June 21, 2026",
        "agent": "Not yet identified",
        "summary": [
            "David asks what stops Uber from deleting the fraudulent account.",
            'Uber responds: "We understand the severity of this incident, but multiple submissions will delay the resolution."',
            "David asks Uber to pause the fraudulent account and asks if it is still operating.",
            'Uber states: "David, sorry to inform you, however, we are not authorized to delete the other account."',
        ],
        "admission": "Uber acknowledges the severity of the incident but refuses to delete or pause the fraudulent account."
    },
    {
        "id": "Screenshot 6 — IMG_8424",
        "time": "June 21, 2026",
        "agent": "Not yet identified",
        "summary": [
            'David presses: "Is it still operating under my name?"',
            'Uber confirms: "Yes, David, that account is registered with your name."',
            'David clarifies: "Im asking if its being used not if registered."',
        ],
        "admission": "Uber verbally confirms a second account is actively registered under David's name."
    },
    {
        "id": "Screenshot 7 — IMG_8425",
        "time": "June 21, 2026",
        "agent": "Not yet identified",
        "summary": [
            'Uber states: "Due to privacy, we are not able to share more information about that account."',
            'David responds: "Oh thanks, you don\'t have to share information about the thief that\'s using my account. Very useful. Wonder how that will hold up in court."',
        ],
        "admission": "Uber invokes privacy protections to shield information about a fraudulent account — effectively protecting the perpetrator over the victim."
    },
    {
        "id": "Screenshot 8 — IMG_8426",
        "time": "June 21, 2026",
        "agent": "Not yet identified",
        "summary": [
            "David again asks Uber to delete the fraudulent account.",
            "Uber reiterates it cannot delete it but the case was escalated to a specialized team.",
            'Uber states: "David, I understand your frustration, however as I can see your account is marked as a duplicate at this time, as there is other account using your document and information."',
            'Uber states: "A specialist will follow up with you when your case is being processed."',
        ],
        "admission": "Uber confirms another account is actively using David's documents and personal information."
    },
    {
        "id": "Screenshot 9 — IMG_8427",
        "time": "June 21, 2026",
        "agent": "Not yet identified",
        "summary": [
            'David asks: "Can you confirm that there is currently an active account on Uber\'s platform registered using my personal identity documents?"',
            'Uber confirms: "We can confirm that there is another account in your name with the email address: davidm*******1@hotmail.com; however, we are not able to see the status of the account."',
            'David asks: "Can you confirm that I, David, did not create that account and have no access to it?"',
            "Uber responds the specialized team is actively investigating.",
        ],
        "admission": "Uber formally confirms on record that a second account exists in David's name using his identity documents."
    },
    {
        "id": "Screenshot 10 — IMG_8428",
        "time": "Sun, Jun 21 at 10:10 AM",
        "agent": "Sonali",
        "summary": [
            'Uber (Sonali) states: "Since it was not created by you, I have escalated your case to the investigation team."',
            'David asks: "What is Uber\'s policy when a user\'s identity documents are found on an account they did not create, Sonali?"',
        ],
        "admission": "Uber agent Sonali explicitly states the account was not created by David and confirms escalation to investigation team."
    },
    {
        "id": "Screenshot 11 — IMG_8429",
        "time": "Sun, Jun 21 at 10:10 AM",
        "agent": "Sonali",
        "summary": [
            'Sonali responds: "Team will investigate your account if the other account was created by someone else; this account will be updated, and you will be able to work with this account."',
        ],
        "admission": "Uber commits in writing that David will be able to work once investigation confirms the other account was fraudulently created."
    },
    {
        "id": "Screenshot 12 — IMG_8430",
        "time": "Sun, Jun 21, 2026",
        "agent": "Sonali",
        "summary": [
            'David asks: "How long does this investigation typically take? I am losing income every day I cannot work."',
            'Sonali responds: "Our specialized team usually starts working on identity theft cases within 72 hours."',
        ],
        "admission": "Uber acknowledges this is an identity theft case and commits to beginning investigation within 72 hours of June 21, 2026 — by June 24, 2026."
    },
    {
        "id": "Screenshot 13 — IMG_8431",
        "time": "Sun, Jun 21 at 10:16 AM",
        "agent": "Sonali",
        "summary": [
            'David asks: "Can you confirm in writing that once the investigation concludes, my background check will proceed and my account will be fully reinstated?"',
            'Sonali begins response: "Yes, David, once the investigation is completed your account will be update and your background check..."',
        ],
        "admission": "Uber begins written confirmation of reinstatement."
    },
    {
        "id": "Screenshot 14 — IMG_8432",
        "time": "Sun, Jun 21 at 10:16 AM",
        "agent": "Sonali",
        "summary": [
            'Sonali completes: "Yes, David, once the investigation is completed your account will be update and your background check will started as per the result."',
            'David asks: "Is there a process for Uber to compensate drivers for income lost due to identity theft on your platform that prevented them from working?"',
        ],
        "admission": "Uber confirms in writing that David's background check WILL proceed and his account WILL be reinstated following the investigation."
    },
    {
        "id": "Screenshot 15 — IMG_8433",
        "time": "Sun, Jun 21 at 10:16 AM",
        "agent": "Sonali",
        "summary": [
            'Sonali responds: "David, sorry, however, since the ID theft is not done by Uber, Uber will not be able to compensate."',
        ],
        "admission": "Uber acknowledges ID theft occurred but denies responsibility for compensation, stating it was not done by Uber — implicitly confirming the theft was carried out by a third party using their platform."
    },
]

for s in screenshots:
    story.append(Paragraph(s["id"], subheading_style))
    story.append(Paragraph(f"<b>Date/Time:</b> {s['time']}", meta_style))
    story.append(Paragraph(f"<b>Support Agent:</b> {s['agent']}", meta_style))
    story.append(Spacer(1, 0.04*inch))
    story.append(Paragraph("<b>Summary:</b>", body_style))
    for item in s["summary"]:
        story.append(Paragraph(f"• {item}", body_style))
    story.append(Spacer(1, 0.03*inch))
    story.append(Paragraph(f"<b>KEY ADMISSION:</b> {s['admission']}", key_style))
    if "note" in s:
        story.append(Paragraph(f"<i>Note: {s['note']}</i>", meta_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    story.append(Spacer(1, 0.08*inch))

story.append(Spacer(1, 0.1*inch))
story.append(Paragraph("SUMMARY OF KEY ADMISSIONS BY UBER", heading_style))
story.append(Spacer(1, 0.05*inch))

table_data = [
    ["#", "Admission", "Screenshot"],
    ["1", "Second account exists in David's name using his identity documents", "IMG_8427"],
    ["2", "David did not create that account", "IMG_8428"],
    ["3", "Uber classifies this as an identity theft case", "IMG_8430"],
    ["4", "David cannot work or complete background check due to fraudulent account", "IMG_8422"],
    ["5", "Uber refused to delete or pause the fraudulent account", "IMG_8423"],
    ["6", "Uber protected the fraudster's privacy over the victim's", "IMG_8425"],
    ["7", "Investigation to begin within 72 hours (by June 24, 2026)", "IMG_8430"],
    ["8", "Account will be reinstated and background check will proceed post-investigation", "IMG_8432"],
    ["9", "Uber acknowledges ID theft occurred but denies compensation responsibility", "IMG_8433"],
]

table = Table(table_data, colWidths=[0.3*inch, 5.2*inch, 1.1*inch])
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a1a')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, -1), 8),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
]))
story.append(table)

story.append(Spacer(1, 0.15*inch))
story.append(Paragraph("INCOME LOSS LOG", heading_style))
story.append(Spacer(1, 0.05*inch))

loss_data = [
    ["Field", "Value"],
    ["Date blocking began", "To be confirmed"],
    ["Date documented", "June 21, 2026"],
    ["Days unable to work", "_______________"],
    ["Average daily earnings", "$_______________"],
    ["Total estimated loss to date", "$_______________"],
]
loss_table = Table(loss_data, colWidths=[2.5*inch, 4.1*inch])
loss_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a1a')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
]))
story.append(loss_table)

story.append(Spacer(1, 0.15*inch))
story.append(Paragraph("NEXT STEPS & DEADLINES", heading_style))
story.append(Spacer(1, 0.05*inch))

steps = [
    "[ ] File police report for identity theft — include fraudster email: davidm*******1@hotmail.com",
    "[ ] Screenshot all chat logs (done — 15 screenshots captured)",
    "[ ] Monitor for Uber investigation update by June 24, 2026",
    "[ ] If no contact by June 24 — escalate to Uber Legal Team in writing",
    "[ ] File FTC identity theft report at reportfraud.ftc.gov",
    "[ ] Track daily income loss with dates and amounts",
    "[ ] Consult a lawyer regarding negligence claim against Uber",
]
for step in steps:
    story.append(Paragraph(step, body_style))

story.append(Spacer(1, 0.15*inch))
story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph("Document prepared: June 21, 2026 | All screenshots retained as evidence", meta_style))
story.append(Paragraph("CONFIDENTIAL — FOR LEGAL USE", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))

doc.build(story)
print("PDF created successfully.")
