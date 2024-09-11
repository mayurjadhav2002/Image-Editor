import {Request, Response} from "express";
import prisma from "../prisma/connect";
import {extractUniqueValues} from "../utils/func";

const getFirstData = async (
	email?: string,
	phoneNumber?: string,
	linkPref: string = "primary"
) => {
	return prisma.contact.findFirst({
		where: {
			OR: [
				{email: email ?? undefined},
				{phoneNumber: phoneNumber ?? undefined},
			],
			linkPrecedence: linkPref,
		},
	});
};

const getAllContactsByPrimary = async (
	email?: string,
	phoneNumber?: string,
	primaryID?: any
) => {
	return prisma.contact.findMany({
		where: {
			OR: [
				{email: email ?? undefined},
				{phoneNumber: phoneNumber ?? undefined},
				{linkedId: primaryID ?? undefined},
			],
		},
	});
};

const createSecondaryContact = async (
	email: string | undefined,
	phoneNumber: string | undefined,
	primaryID: number
) => {
	if (email || phoneNumber) {
		await prisma.contact.create({
			data: {
				email: email,
				phoneNumber: phoneNumber,
				linkedId: primaryID,
				linkPrecedence: "secondary",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});
	}
};

const FindContact = async (req: Request, res: Response) => {
	try {
		if (!req.body || (!req.body.email && !req.body.phoneNumber)) {
			return res
				.status(400)
				.send({message: "Email and Phone Number both are missing"});
		}

		const {email, phoneNumber} = req.body;

		// Checking if contact is present in db at primary level if not then checking for secondary level
		// and based on secondary level, with linkedId values fetching main primary data

		let primaryContact = await getFirstData(email, phoneNumber, "primary");

		if (!primaryContact) {
			const secondaryContact = await getFirstData(
				email,
				phoneNumber,
				"secondary"
			);
			if (secondaryContact?.linkedId) {
				primaryContact = await prisma.contact.findUnique({
					where: {id: secondaryContact.linkedId},
				});
			}
		}

		if (!primaryContact) {
			return res
				.status(404)
				.send({message: "Contact not found with the provided details"});
		}

		const allData = await getAllContactsByPrimary(
			primaryContact.email ?? undefined,
			primaryContact.phoneNumber ?? undefined,
			primaryContact.id
		);

		const allEmails = extractUniqueValues(allData, "email");
		const allPhoneNumbers = extractUniqueValues(allData, "phoneNumber");
		const SecondaryPrecedence = allData.filter(
			(contact: {linkPrecedence: string; linkedId: any}) =>
				contact.linkPrecedence === "secondary"
		);
		const secondaryContactIds = extractUniqueValues(
			SecondaryPrecedence,
			"id"
		);

		// Checking if email or phone number is new and not present in database
		const isNewEmail = email && !allEmails.includes(email);
		const isNewPhoneNumber =
			phoneNumber && !allPhoneNumbers.includes(phoneNumber);
		if (isNewEmail) {
			allEmails.push(email);
			await createSecondaryContact(email, undefined, primaryContact.id);
		}
		if (isNewPhoneNumber) {
			allPhoneNumbers.push(phoneNumber);
			await createSecondaryContact(
				undefined,
				phoneNumber,
				primaryContact.id
			);
		}

		return res.status(200).send({
			contact: {
				primaryContatctId: primaryContact.id,
				emails: allEmails,
				phoneNumbers: allPhoneNumbers,
				secondaryContactIds: secondaryContactIds,
			},
		});
	} catch (error) {
		return res
			.status(500)
			.send({message: "Internal Server Error", error: error});
	}
};

module.exports = {FindContact};
