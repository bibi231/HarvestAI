---
title: "The Ethics and Legality of Web Scraping for Nigerian Businesses"
excerpt: "A clear-eyed look at where web scraping is legally permitted in Nigeria, what the NDPA says about personal data, and the ethical lines businesses should not cross."
date: "2026-06-10"
author: "HarvestAI Team"
tags: ["ethics", "NDPA", "web scraping", "legal"]
readingTime: 5
---

## What the Law Actually Says

Nigeria's **Nigeria Data Protection Act (NDPA) 2023** is the primary legal framework governing how personal data can be collected, processed, and stored. It replaced the earlier NDPR and introduced stricter obligations for data controllers and processors.

For web scraping specifically, the key questions are:

1. **Is the data personal?** Company names, trading addresses, and registered phone numbers for businesses are generally not personal data. But individual names, personal emails, and phone numbers tied to specific people are.
2. **Was the data made publicly available with consent?** Data posted on a public website by the data subject (e.g., a consultant listing themselves on a professional directory) differs from data aggregated without the person's knowledge.
3. **What are you doing with it?** Collecting for internal market research is treated differently than building a product that resells personal profiles.

**The NDPA does not prohibit scraping of business data** — but scraping personal data without a lawful basis (consent, legitimate interest, contract, legal obligation) is a compliance risk.

## What's Generally Acceptable

- Scraping **publicly listed business information**: company name, address, industry category, general contact number
- Collecting **pricing and product data** from e-commerce platforms for competitive analysis
- Monitoring **publicly published news and announcements** for market intelligence
- Pulling **SERP data** (what terms businesses rank for, what ads they run)

## Where the Lines Are

- Scraping **personal email addresses** from websites and using them for unsolicited marketing falls under NDPA obligations around lawful basis and consent
- Bypassing **login walls or CAPTCHAs** is a terms-of-service violation and potentially a cybercrime under the **Cybercrimes (Prohibition, Prevention, Etc.) Act 2015**
- Building databases that **profile individuals** without their knowledge creates data protection liability, especially if you process sensitive categories of data

## The Ethical Framework Beyond Compliance

Legal compliance is the floor, not the ceiling. The more useful ethical question: **would the person whose data you're collecting object if they knew?**

A business that lists itself on VConnect to attract customers would not reasonably object to you adding their details to your prospect list. A private individual whose personal contact was scraped from a forum without permission would.

Responsible scraping practices include:

- Respecting `robots.txt` directives where they restrict data collection
- Not placing undue load on servers (rate-limiting requests)
- Keeping data current and removing records where subjects have opted out
- Having a documented **legitimate interest assessment** if you're processing borderline personal data

## Practical Takeaway

Nigerian businesses using scraping for **B2B intelligence** — competitor pricing, market mapping, lead discovery from business directories — sit comfortably within legal and ethical norms, provided they are working with business data rather than personal profiles. When individual-level data is involved, apply NDPA principles: lawful basis, data minimisation, purpose limitation, and retention limits.
