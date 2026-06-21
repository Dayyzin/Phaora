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

story.append(Paragraph("<b>Victim:</b> David Vaz", body_style))
story.append(Paragraph("<b>Victim Email(s):</b> davidmvaz@hotmail.com | david1002105@hotmail.com | iamtradingoptions@gmail.com", body_style))
story.append(Paragraph("<b>Victim Phone:</b> (774) 578-0307", body_style))
story.append(Paragraph("<b>Victim Address:</b> 249 Boston Post Road East, Apt. 11, Marlborough, MA 01752", body_style))
story.append(Paragraph("<b>Date of Original Report to Uber:</b> January 13, 2023", body_style))
story.append(Paragraph("<b>Date of Current Documentation:</b> Sunday, June 21, 2026", body_style))
story.append(Paragraph("<b>Platform:</b> Uber Driver App — In-App Support Chat & Email", body_style))
story.append(Paragraph("<b>Fraudulent Account Email (2023):</b> p...5@gmail.com (changed by fraudster)", body_style))
story.append(Paragraph("<b>Fraudulent Account Email (2026):</b> davidm*******1@hotmail.com", body_style))
story.append(Paragraph("<b>Duration of Unresolved Fraud:</b> January 13, 2023 to June 21, 2026 — approximately 3.5 YEARS", key_style))
story.append(Spacer(1, 0.15*inch))

story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("PART 1: PRIOR NOTICE — JANUARY 2023 EMAIL EVIDENCE", heading_style))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph(
    "CRITICAL: The following email exchanges prove Uber was formally notified of this identity theft on January 13, 2023 — "
    "over 3.5 years before the June 21, 2026 support chat. Uber failed to resolve the issue, deactivated David's legitimate "
    "account, and sent him in procedural circles. This establishes long-term negligence and prior knowledge.",
    key_style))
story.append(Spacer(1, 0.1*inch))

prior_screenshots = [
    {
        "id": "Email 1 — IMG_8447 & IMG_8448 & IMG_8449",
        "time": "January 2023 (exact date partially visible)",
        "agent": "Uber Support (automated/unidentified)",
        "summary": [
            "Uber emails David stating required documents are expired or missing from his account.",
            "Documents listed as missing: Vehicle Registration, Vehicle Insurance, Profile Photo, State Vehicle Inspection, TNC Inspection.",
            "Uber instructs David to log in and upload documents — but David cannot log in because the account is blocked.",
            "This creates a deliberate circular trap: Uber requires document upload to reactivate, but blocks access needed to upload.",
        ],
        "admission": "Uber's own system acknowledges David's account requires document updates but blocks him from making them — a procedural trap that prevented resolution."
    },
    {
        "id": "Email 2 — IMG_8450",
        "time": "Friday, January 13, 2023",
        "agent": "David Vaz (victim) to Uber Support",
        "summary": [
            'David writes: "Hello, it must\'ve been stolen my original account. All emails that I have are davidmvaz@hotmail.com, david1002105@hotmail.com and iamtradingoptions@gmail.com."',
            '"To prove, I can send documents while holding next to my face, as opposed to the other person that has stolen some of my documents like drivers license since my computer has been hacked and corrupted some documents, stole information, etc."',
            "David explicitly reports: (1) identity theft, (2) drivers license stolen, (3) computer hacked, (4) offers to provide video proof of identity.",
        ],
        "admission": "David formally reported identity theft, document theft, and computer hacking to Uber on January 13, 2023. Uber was on notice from this date. David offered to provide facial verification — Uber did not take him up on this offer."
    },
    {
        "id": "Email 3 — IMG_8451",
        "time": "January 2023",
        "agent": "Uber Support",
        "summary": [
            'Uber responds: "In a recent review of your account, your account was identified as a duplicate of an account that was previously deactivated."',
            'Uber instructs: "If you believe this is an error, please contact us from your original account\'s email address at p...5@gmail.com"',
            "The fraudulent account email in 2023 begins with 'p' and ends with '5@gmail.com' — different from the 2026 fraudulent email (davidm*******1@hotmail.com), suggesting the fraudster changed the account email at some point.",
        ],
        "admission": "Uber identifies the fraudulent account email as 'p...5@gmail.com' in 2023. Uber instructs David to email from an account the fraudster controls — a circular trap making resolution impossible. This is the same pattern Uber repeated in 2026."
    },
    {
        "id": "Email 4 — IMG_8452",
        "time": "Friday, January 13, 2023 at 2:44:09 PM",
        "agent": "David Vaz to Uber Support",
        "summary": [
            'David responds: "Im the account holder, but my email was switched from a impersonator."',
            "Email sent to: davidmvaz@hotmail.com (confirming David's real email address).",
        ],
        "admission": "David explicitly states an impersonator switched the account email. Uber received this information on January 13, 2023."
    },
    {
        "id": "Email 5 — IMG_8453",
        "time": "January 2023",
        "agent": "Uber Support",
        "summary": [
            'Uber responds: "If you are the account holder, please write in from the email address associated with your account, and we\'ll be able to help you right away."',
            "Uber again instructs David to email from the account that the impersonator controls.",
            "This is the same circular trap: Uber requires contact from the hacked email, which David cannot access because the fraudster controls it.",
        ],
        "admission": "Uber's own support process trapped David in an unresolvable loop — requiring contact from a compromised email address as the only path to resolution. This procedural failure constitutes negligence."
    },
    {
        "id": "Email 6 — IMG_8454 & IMG_8455 & IMG_8456",
        "time": "Saturday, January 14, 2023",
        "agent": "Uber Support — Agent Shivam (sshiva45)",
        "summary": [
            'David asks: "I\'ve stated many times though already that I can\'t open the driver app. Could I have the phone number here?"',
            'Uber agent Shivam responds: "In a recent review of your account, your account was identified as a duplicate of an account that was previously deactivated. According to the Community Guidelines, fraudulent activity such as creating duplicate accounts is not allowed."',
            'Shivam continues: "Because your account appears to be associated with an account that was previously deactivated, YOUR ACCOUNT HAS BEEN DEACTIVATED."',
            '"If you believe this decision was made in error, or have any questions, please feel free to reach out through phone support in your app."',
        ],
        "admission": "CRITICAL: Uber agent Shivam formally deactivated David's legitimate account on January 14, 2023, citing it as a duplicate — punishing the victim for the fraudster's actions. This deactivation has apparently remained in effect for 3.5 years. Uber directed David to phone support in an app he could not access."
    },
    {
        "id": "Email 7 — IMG_8457",
        "time": "Saturday, January 14, 2023 at 3:38:48 PM",
        "agent": "David Vaz to Uber Support",
        "summary": [
            'David provides identity verification details: "Last four is 3328, and the email will be either one of these: david1002105@hotmail.com, davidmvaz@hotmail.com or iamtradingoptions@gmail.com."',
            '"I believe the person who hacked the account changed emails and now it\'s one starting with \'p\', but I\'m not associated with that one."',
            "David provides: Phone: (774) 578-0307 | Address: 249 Boston Post Road East, Apt. 11, Marlborough, MA 01752",
            "David explicitly identifies the fraudulent email as starting with 'p' — not his.",
        ],
        "admission": "David provided full personal identifying information to Uber on January 14, 2023 to prove his identity. Uber had all information needed to distinguish the legitimate account from the fraudulent one and still failed to act."
    },
    {
        "id": "Email 8 — IMG_8458 & IMG_8459",
        "time": "January 14, 2023",
        "agent": "Uber Support — Agent Shivam (sshiva45)",
        "summary": [
            "Shivam requests: last 4 digits of driver's license and email/phone/mailing address to associate with the account.",
            "David had already provided all of this information.",
        ],
        "admission": "Uber requested verification information that David had already provided, suggesting either poor case management or deliberate delay tactics."
    },
    {
        "id": "Email 9 — IMG_8460",
        "time": "Saturday, January 14, 2023 at 4:15:41 PM",
        "agent": "David Vaz to Uber Support",
        "summary": [
            'David responds: "Since it\'s correct, could you guys unblock the account for me?"',
        ],
        "admission": "David confirmed all requested information and explicitly asked Uber to unblock his account on January 14, 2023."
    },
    {
        "id": "Email 10 — IMG_8461",
        "time": "January 14, 2023",
        "agent": "Uber Support — Agent Shivam (sshiva45)",
        "summary": [
            'Shivam responds: "We reviewed your account, and can confirm that your information is currently listed correctly on your profile."',
            '"Moreover, For providing you better resolution we are arranging a callback and you may expect a call within next estimated 24 business hours from our specialist to discuss it further."',
        ],
        "admission": "CRITICAL: Uber confirmed David's information is correct on his profile — meaning Uber verified he is the legitimate account holder. Uber promised a specialist callback within 24 business hours. This callback apparently never resolved the issue, as the account remained deactivated for 3.5 years. This promise and failure to deliver is direct evidence of negligence."
    },
]

for s in prior_screenshots:
    story.append(Paragraph(s["id"], subheading_style))
    story.append(Paragraph(f"<b>Date/Time:</b> {s['time']}", meta_style))
    story.append(Paragraph(f"<b>Agent/Sender:</b> {s['agent']}", meta_style))
    story.append(Spacer(1, 0.04*inch))
    story.append(Paragraph("<b>Summary:</b>", body_style))
    for item in s["summary"]:
        story.append(Paragraph(f"• {item}", body_style))
    story.append(Spacer(1, 0.03*inch))
    story.append(Paragraph(f"<b>KEY FINDING:</b> {s['admission']}", key_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    story.append(Spacer(1, 0.08*inch))

story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
story.append(Spacer(1, 0.1*inch))
story.append(Paragraph("PART 2: IN-PERSON VISIT — UBER GREENLIGHT HUB, BOSTON AREA (2023)", heading_style))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph(
    "CRITICAL: In 2023, David physically visited the Uber Greenlight Hub in the Boston area "
    "(the only such facility in the region — location is unambiguous). During this visit, Uber staff "
    "showed David the fraudster's full name and photograph on their system. Despite having the perpetrator's "
    "complete identity confirmed, Uber staff stated they could not take action because they did not have "
    "CONSENT FROM THE PERPETRATOR. No paperwork or documentation was provided to David during this visit. "
    "David was in shock and unable to document the interaction at the time.",
    key_style))
story.append(Spacer(1, 0.1*inch))

inperson_data = [
    ["Field", "Detail"],
    ["Year of Visit", "2023 (exact date to be confirmed via phone location history)"],
    ["Location", "Uber Greenlight Hub — Boston area, MA (only one facility in region)"],
    ["What Uber Showed David", "Fraudster's full name and photograph on Uber's internal system"],
    ["Uber's Stated Reason for Inaction", "\"We cannot take action without consent from the perpetrator\""],
    ["Documentation Provided", "None — David was in shock"],
    ["Uber Staff Names", "Unknown — to be obtained via subpoena of hub visitor/staff logs"],
    ["Legal Significance", "Uber identified the perpetrator and knowingly chose not to act"],
]
inperson_table = Table(inperson_data, colWidths=[2.2*inch, 4.4*inch])
inperson_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8B0000')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fff0f0')]),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
]))
story.append(inperson_table)
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("WHY THIS IS LEGALLY SIGNIFICANT:", subheading_style))
legal_visit_points = [
    "Uber's own staff IDENTIFIED the perpetrator by name and photo — proving Uber has full knowledge of who committed the fraud.",
    "Uber's stated reason for inaction — requiring the PERPETRATOR'S CONSENT — is legally indefensible and potentially constitutes obstruction.",
    "No legitimate platform requires a criminal's permission to stop a crime being committed on their platform.",
    "The Uber Greenlight Hub has visitor logs, staff records, and internal case notes that can be obtained via court subpoena.",
    "Staff members who showed David the fraudster's identity are compellable witnesses.",
    "This visit, combined with the January 2023 email chain, proves Uber had full knowledge of the fraud and the fraudster's identity for years — and chose to protect the perpetrator over the victim.",
]
for point in legal_visit_points:
    story.append(Paragraph(f"• {point}", body_style))
story.append(Spacer(1, 0.1*inch))

story.append(Paragraph(
    "ACTION REQUIRED: Request police issue a subpoena to Uber Technologies for: (1) the full identity of the "
    "person whose photo and name were shown to David at the Boston Greenlight Hub in 2023, (2) all internal "
    "case notes from that visit, (3) staff member names present during the visit, (4) any record of the "
    "stated 'perpetrator consent' policy.",
    key_style))

story.append(Spacer(1, 0.1*inch))
story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
story.append(Spacer(1, 0.1*inch))
story.append(Paragraph("PART 3: JUNE 21, 2026 — IN-APP SUPPORT CHAT", heading_style))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph(
    "The following support chat took place 3.5 years after Uber's initial failure to resolve the identity theft. "
    "The same pattern repeats: Uber acknowledges the fraud, makes commitments, but the underlying issue remains unresolved.",
    body_style))
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
    {
        "id": "Screenshot 16 — IMG_8436",
        "time": "Sun, Jun 21 at 10:29 AM",
        "agent": "Sonali",
        "summary": [
            'David asks: "If the account using my identity is currently active and causes an incident, am I legally exposed in any way?"',
            'Sonali deflects: "As I mentioned we are not authorized to share the personal details of the other account."',
            'Sonali adds: "It will be handled by the investigation team."',
        ],
        "admission": "Sonali refuses to answer whether David bears legal liability, deflecting twice and passing the question to the investigation team rather than providing a direct denial. The failure to say 'No, you bear no liability' is significant — it cannot be interpreted as reassurance."
    },
    {
        "id": "Screenshot 17 — IMG_8437",
        "time": "Sun, Jun 21, 2026",
        "agent": "Sonali",
        "summary": [
            'David asks: "Will my personal identity documents be removed from the fraudulent account regardless of the investigation outcome?"',
            'Sonali confirms: "Yes, David, your documents will be removed."',
            'David asks: "If the account using my identity is currently active and causes an incident, am I legally exposed in any way?"',
            'Sonali deflects: "As I mentioned we are not authorized to share the personal details of the other account."',
        ],
        "admission": "Uber confirms in writing that David's personal identity documents WILL be removed from the fraudulent account regardless of investigation outcome. Uber refuses to answer whether David bears legal liability if the fraudulent account causes harm — citing privacy rather than denying liability."
    },
    {
        "id": "Screenshot 17 — IMG_8438",
        "time": "Sun, Jun 21 at 10:40 AM",
        "agent": "April (new agent)",
        "summary": [
            'David repeats legal liability question, asking for a yes or no answer.',
            'New agent April joins the chat.',
            'April attempts to minimize: "I want to reassure you that the only impact this issue has is that it temporarily pauses your sign-up process."',
            'April incorrectly states: "You won\'t be able to finish creating your account until we get this resolved." — implying David is a new user, not an existing driver.',
        ],
        "admission": "New agent April directly contradicts all previous admissions by characterizing the identity theft situation as merely a \"sign-up pause\" — a significantly lesser framing. April also incorrectly identifies David as a new user creating an account rather than an existing Uber driver. This contradiction between agents is itself evidence of inconsistent handling of the case.",
        "note": "CRITICAL: April's attempt to reframe the situation as a minor sign-up issue directly contradicts Sonali's admissions of identity theft, account suspension, document removal, and reinstatement promise."
    },
    {
        "id": "Screenshot 18 — IMG_8439",
        "time": "Sun, Jun 21 at 10:40 AM",
        "agent": "April",
        "summary": [
            'David challenges April directly: "April, with respect, this is not a sign-up pause. Earlier today, Sonali confirmed this is an identity theft case, that a fraudulent account using my documents has been suspended, that my documents will be removed, and that my account will be fully reinstated after investigation. Are you saying that information was incorrect?"',
            'David also clarifies: "I am not creating a new account. I am an existing Uber driver whose background check has been blocked due to a fraudulent account using my identity."',
        ],
        "admission": "David formally challenges April's contradictory statements on record, citing all prior admissions by Sonali. This exchange demonstrates Uber's inconsistent communication and establishes that David is an existing driver, not a new applicant."
    },
    {
        "id": "Screenshot 19 — IMG_8440",
        "time": "Sun, Jun 21 at 10:42 AM",
        "agent": "April",
        "summary": [
            'April backs down and aligns with Sonali\'s admissions: "I understand your concerns, and I can confirm that the investigation is ongoing with the appropriate actions being taken, including suspension of the fraudulent account and removal of your documents. Your account reinstatement will proceed once the investigation is complete."',
        ],
        "admission": "After being challenged, April reverses her earlier minimization and CONFIRMS all key admissions: (1) investigation is active, (2) fraudulent account has been suspended, (3) David's documents are being removed, (4) David's account WILL be reinstated. This is now confirmed by TWO separate Uber agents in writing.",
        "note": "April's reversal after pressure demonstrates that her earlier minimization was inaccurate and that the full scope of admissions made by Sonali stand as the authoritative Uber position."
    },
    {
        "id": "Screenshot 20 — IMG_8441",
        "time": "Sun, Jun 21, 2026 (closing exchange)",
        "agent": "April",
        "summary": [
            'April confirms in final message: "...active, and once completed, your account will be reinstated and your background check will proceed accordingly. We greatly appreciate your understanding regarding this matter."',
            'David sends formal closing summary: "Thank you April. To summarize what has been confirmed today by multiple Uber agents: a fraudulent account using my identity documents has been identified, suspended, and my documents will be removed. My account will be fully reinstated and background check will proceed once the investigation completes within 72 hours. I have this entire conversation saved for my records. Thank you."',
        ],
        "admission": "David's closing summary — placing the full scope of all admissions on record — was sent to Uber without contradiction or correction. April's final message confirms account reinstatement and background check proceeding. Uber's failure to correct or dispute David's summary constitutes tacit acknowledgement of all stated facts."
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
    ["10", "David's identity documents WILL be removed from fraudulent account regardless of outcome", "IMG_8437"],
    ["11", "Uber refused to answer yes/no whether David bears legal liability — did not deny it", "IMG_8437/8438"],
    ["12", "Agent April attempted to minimize case as a 'sign-up pause' — directly contradicting all prior admissions", "IMG_8438"],
    ["13", "April reversed her position under challenge — confirming: investigation active, account suspended, documents being removed, reinstatement guaranteed", "IMG_8440"],
    ["14", "All key admissions now confirmed by TWO separate Uber agents (Sonali and April)", "IMG_8440"],
    ["15", "Uber refused to deny David's legal liability if fraudulent account causes harm — passed to investigation team", "IMG_8436"],
    ["16", "David's closing summary sent to Uber — not disputed or corrected, constituting tacit acknowledgement", "IMG_8441"],
    ["17", "PRIOR NOTICE: David formally reported identity theft to Uber on January 13, 2023 — 3.5 years before June 2026", "IMG_8450"],
    ["18", "PRIOR NOTICE: Uber deactivated David's legitimate account on January 14, 2023, punishing the victim", "IMG_8456"],
    ["19", "PRIOR NOTICE: Uber confirmed David's identity information was correct on his profile in January 2023", "IMG_8461"],
    ["20", "PRIOR NOTICE: Uber promised a specialist callback within 24 business hours in January 2023 — never resolved", "IMG_8461"],
    ["21", "PRIOR NOTICE: Uber's 2023 circular trap (email from hacked account) is the same tactic used in 2026", "IMG_8451/8453"],
    ["22", "PRIOR NOTICE: Fraudster's email changed between 2023 (p...5@gmail.com) and 2026 (davidm*******1@hotmail.com)", "IMG_8451/8427"],
    ["23", "Uber had documented knowledge of this fraud for 3.5 years and failed to permanently resolve it", "ALL 2023 EMAILS"],
    ["24", "IN PERSON: Uber staff showed David the fraudster's full name and photo at Boston Greenlight Hub (2023)", "Witness testimony"],
    ["25", "IN PERSON: Uber refused to act citing need for 'perpetrator's consent' — protecting the criminal over the victim", "Witness testimony"],
    ["26", "IN PERSON: Uber had the perpetrator's identity and knowingly chose not to remove stolen documents", "Witness testimony"],
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
story.append(Paragraph("WITNESS STATEMENT", heading_style))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph(
    "The following witness has direct knowledge of the in-person visit to the Uber Greenlight Hub in Boston in 2023 "
    "and is prepared to provide testimony and sign this statement.",
    body_style))
story.append(Spacer(1, 0.1*inch))

witness_data = [
    ["Field", "Detail"],
    ["Witness Full Name", "Daniel Machado Vaz"],
    ["Relationship to Victim", "Brother"],
    ["Nature of Knowledge", "David called Daniel immediately after the in-person Uber Greenlight Hub visit in 2023 and described the full encounter"],
    ["What Witness Recalls", "David told him Uber staff showed the fraudster's name and photograph, and stated they could not act without the perpetrator's consent"],
    ["Willingness to Testify", "Yes — willing to sign statement and testify"],
]
witness_table = Table(witness_data, colWidths=[2.2*inch, 4.4*inch])
witness_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a1a')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
]))
story.append(witness_table)
story.append(Spacer(1, 0.15*inch))

story.append(Paragraph("WITNESS DECLARATION", subheading_style))
story.append(Spacer(1, 0.05*inch))

witness_text = (
    "I, Daniel Machado Vaz, confirm that in 2023, my brother David Vaz called me after visiting the Uber "
    "Greenlight Hub in the Boston area. He told me that Uber staff showed him the name and photograph of the "
    "person who had stolen his identity and was operating an Uber account using his documents. He told me Uber "
    "staff said they could not take action without the perpetrator's consent. I remember this conversation clearly "
    "and am prepared to provide testimony regarding this matter."
)
story.append(Paragraph(witness_text, body_style))
story.append(Spacer(1, 0.3*inch))

sig_data = [
    ["Signature", "Date", "Phone Number"],
    [" " * 40, " " * 20, " " * 20],
]
sig_table = Table(sig_data, colWidths=[3.0*inch, 1.8*inch, 1.8*inch])
sig_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BOX', (0, 1), (0, 1), 0.5, colors.black),
    ('BOX', (1, 1), (1, 1), 0.5, colors.black),
    ('BOX', (2, 1), (2, 1), 0.5, colors.black),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
]))
story.append(sig_table)
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph(
    "Note: This statement carries greater legal weight when notarized. Most banks offer free notarization services.",
    meta_style))

story.append(Spacer(1, 0.15*inch))
story.append(Paragraph("LEGAL ANALYSIS — GROUNDS FOR CLAIM", heading_style))
story.append(Spacer(1, 0.05*inch))

legal_points = [
    ("1. NEGLIGENCE (Long-Term)", "Uber was formally notified of identity theft on January 13, 2023. Uber confirmed David's identity was correct, promised resolution within 24 hours, and failed to deliver. The account remained deactivated for 3.5 years. This constitutes a clear and documented failure of duty of care over an extended period."),
    ("2. NEGLIGENCE (Platform Verification)", "Uber's own support agents were unable to confirm whether Uber verifies that identity documents belong to the account holder. A company that processes driver identity documents for public safety purposes and fails to implement or enforce basic verification controls may be liable for resulting harm."),
    ("3. WRONGFUL DEACTIVATION", "Uber deactivated David's legitimate account in January 2023 citing it as a 'duplicate' — effectively punishing the victim for the fraudster's actions. This wrongful deactivation prevented David from earning income for 3.5 years."),
    ("4. INCOME LOSS", "David has been unable to complete his background check and work as an Uber driver due to Uber's failure to resolve a known fraud. Every day of lost income since the deactivation may be recoverable."),
    ("5. PROCEDURAL ENTRAPMENT", "Uber's repeated instruction to 'contact us from your original account email' — an email controlled by the fraudster — constitutes a procedural trap that made resolution impossible by design. This occurred in both 2023 and 2026."),
    ("6. PRIVACY INVERSION", "Uber cited 'privacy' to protect information about the fraudulent account from the victim whose identity was stolen. Uber effectively shielded the perpetrator from the victim using its own privacy policy."),
    ("7. REFUSAL TO CONFIRM LIABILITY", "When asked directly whether David bears legal liability if the fraudulent account causes harm, Uber refused to answer yes or no on multiple occasions. This failure to deny liability is legally significant."),
    ("8. KNOWING PROTECTION OF A CRIMINAL (Most Severe)", "At the Boston Greenlight Hub in 2023, Uber staff identified the fraudster by name and photo to David, then refused to act citing need for 'the perpetrator's consent.' Knowingly maintaining a fraudulent account — after identifying the fraudster — and requiring the criminal's permission to stop the crime is the most egregious finding in this case. It raises questions beyond civil negligence, potentially touching on criminal facilitation."),
]

for title, text in legal_points:
    story.append(Paragraph(f"<b>{title}</b>", body_style))
    story.append(Paragraph(text, body_style))
    story.append(Spacer(1, 0.05*inch))

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
    "[ ] File police report for identity theft — include BOTH fraudster emails: p...5@gmail.com (2023) and davidm*******1@hotmail.com (2026)",
    "[ ] Include January 2023 email chain in police report — proves 3.5 years of documented fraud",
    "[ ] Screenshot all chat logs (done — 36 screenshots/emails captured)",
    "[ ] Monitor for Uber investigation update by June 24, 2026 (72-hour deadline)",
    "[ ] If no contact by June 24 — send formal legal demand letter to Uber Technologies, 1515 3rd St., San Francisco, CA 94158",
    "[ ] File FTC identity theft report at reportfraud.ftc.gov",
    "[ ] Track daily income loss from January 14, 2023 (date of wrongful deactivation) to present",
    "[ ] Consult a lawyer regarding: wrongful deactivation, negligence, and 3.5 years of lost income",
    "[ ] File complaint with Massachusetts Attorney General (victim's state) consumer protection office",
    "[ ] Request full account history from Uber under applicable data protection laws",
]
for step in steps:
    story.append(Paragraph(step, body_style))

story.append(Spacer(1, 0.15*inch))
story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph("Document prepared: June 21, 2026 | Evidence spans January 13, 2023 – June 21, 2026 | All screenshots and emails retained", meta_style))
story.append(Paragraph("CONFIDENTIAL — FOR LEGAL USE | Uber Technologies, 1515 3rd St., San Francisco, CA 94158", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))

doc.build(story)
print("PDF created successfully.")
