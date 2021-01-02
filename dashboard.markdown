---
layout: dashboard
language: en
page_title: Dashboard - Corona Virus in Italy
page_description: A snapshot of the Corona Virus Covid-19 outbreak in Italy
page_keywords: corona virus,covid-19,italy,sars-cov-2
page_content:
- template: chart
  show_title: true
  appearance: Full-bleed
  hidden: true
  title: Today's situation
  introduction: ''
  placeholder_id: counter
  object: counter
  explanation: ''
  centered_title: true
- template: chart
  show_title: true
  appearance: Full-bleed
  hidden: false
  title: Regional trend
  introduction: This chart shows the value of the 7-days moving average of daily new cases in each region.
  explanation: ''
  placeholder_id: regionsJoyPlot
  object: regionsJoyPlot
  centered_title: true
- template: chart
  show_title: true
  appearance: Full-screen
  hidden: true
  title: Regional trend
  introduction: This chart shows the value of the 7-days moving average of daily new cases in each region.
  explanation: ''
  placeholder_id: regionsTrendMap
  object: regionsTrendMap
  centered_title: true
- template: chart
  show_title: true
  appearance: Full-screen
  hidden: true
  object: testsVSnewCases
  placeholder_id: testsVSnewCases
  title: Daily New Cases vs Number of swab tests
  introduction: ''
  explanation: ''
  centered_title: true
- template: chart
  show_title: true
  appearance: Full-screen
  hidden: true
  title: Days comparison
  introduction: ''
  explanation: ''
  placeholder_id: dayComparison
  object: dayComparison
  centered_title: true
- template: chart
  show_title: true
  appearance: Full-bleed
  title: Region by Region
  introduction: ''
  explanation: ''
  placeholder_id: regionsComparison
  object: regionsComparison
  hidden: true
  centered_title: false
  centered_title: true
- template: chart
  show_title: true
  appearance: Centered
  title: Cases by Province
  placeholder_id: provincesMap
  object: provincesMap
  introduction: ''
  explanation: ''
  hidden: true
  centered_title: false
  centered_title: true
---
