# Privacy Policy

**Application:** Yahtzee
**Developer:** Dmytro Melnyk
**Contact email:** dmytromelnyk.app@gmail.com
**Effective date:** May 24, 2026

---

## 1. General Provisions

This Privacy Policy describes how the mobile application **Yahtzee** (hereinafter — the "Application") handles user information. By installing and using the Application, you agree to the terms of this Policy.

The Application is a simple offline scorekeeper for the tabletop game "Yahtzee" played with real dice. It does not require registration, account creation, or an Internet connection for its core functionality.

## 2. What Data We Collect

**The developer does not collect, transmit, or store any personal user data on any servers.**

The Application stores the following data exclusively on the user's device:

- **Player name** — text you enter yourself into the corresponding field for display in the score table.
- **Current game state** — filled-in score table categories, bonuses, and the selected interface language.
- **Language preferences** — the interface language you have chosen (Ukrainian or English).

All of this data is stored locally on your device using the `AsyncStorage` mechanism and is automatically deleted after 24 hours of inactivity.

## 3. How the Data Is Used

Locally stored data is used exclusively for:

- restoring the state of an unfinished game when the Application is reopened;
- displaying your name in the score table;
- preserving your chosen interface language.

**No information is transmitted to the developer, third parties, or any external services.**

## 4. Saving and Opening Game Files

The Application allows the user to:

- **Save the game state** as a JSON file via the system "Share" dialog (`expo-sharing`). The user chooses the storage destination or sharing method.
- **Open a previously saved game file** through the system file picker (`expo-document-picker`).

The developer has no access to these files. They remain entirely under the user's control.

## 5. Application Permissions

The Application may request the following Android system permissions:

- **Storage / file access** — only to open or save game files initiated by the user.

The Application **does not request** permissions to access the camera, microphone, location, contacts, SMS, call logs, or any other personal data.

## 6. Sharing Data with Third Parties

The developer **does not share**, **does not sell**, and **does not disclose** any information to third parties. The Application does not contain:

- advertising networks;
- analytics systems (Google Analytics, Firebase Analytics, etc.);
- crash reporting services;
- user behavior trackers;
- social media integrations.

## 7. Internet Connection

To perform its core functions (scoring, playing dice, saving state), the Application **does not require an Internet connection** and does not make any network requests to developer servers.

## 8. Children's Privacy

The Application is not designed to collect any information from children. Since the Application does not collect personal data at all, it is safe for use by children of any age under parental supervision. The Application was created with the involvement of the developer's children as a family project.

## 9. Data Security

Since all data is stored exclusively locally on the user's device, its security is ensured by the standard protection mechanisms of the Android operating system. The developer has no access to this data and cannot guarantee its preservation in the event of Application uninstallation, cache clearing, or device factory reset.

## 10. Data Deletion

All data stored locally by the Application can be deleted by the user at any time by:

- clearing the Application's data via Android system settings (`Settings → Apps → Yahtzee → Storage → Clear Data`);
- uninstalling the Application from the device;
- waiting 24 hours of inactivity (automatic deletion).

## 11. Changes to the Privacy Policy

The developer reserves the right to update this Privacy Policy. A new version takes effect from the moment it is published as part of a new version of the Application on Google Play. We recommend reviewing this document periodically.

## 12. Contact Information

For any questions regarding this Privacy Policy or data handling in the Application, please contact the developer:

- **Email:** dmytromelnyk.app@gmail.com

---

*This document has been prepared in accordance with Google Play requirements for publishing a Privacy Policy for mobile applications.*
