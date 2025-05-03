"use server"

import { generateObject } from "ai"
import { google } from "@ai-sdk/google"

import { db } from "@/firebase/admin"
import { feedbackSchema } from "@/constants"

export async function createFeedback(params: CreateFeedbackParams) {
	const { interviewId, userId, transcript, feedbackId } = params

	try {
		const formattedTranscript = transcript.map((sentence: { role: string; content: string }) => `- ${sentence.role}: ${sentence.content}\n`).join("")

		const { object } = await generateObject({
			model: google("gemini-2.0-flash-001", {
				structuredOutputs: false,
			}),
			schema: feedbackSchema,
			prompt: `
        Вы — ИИ-собеседник, анализирующий пробное интервью. Ваша задача — оценить кандидата на основе структурированных категорий. Будьте тщательны и подробны в своём анализе. Не будьте снисходительны к кандидату. Если есть ошибки или области, требующие улучшения, укажите на них.  
        Стенограмма:  
        ${formattedTranscript}

        Пожалуйста, оцените кандидата по шкале от 0 до 100 по следующим направлениям. Не добавляйте категории, кроме указанных:
        - **Навыки коммуникации**: Ясность, чёткость речи, структурированность ответов.
        - **Технические знания**: Понимание ключевых концепций, необходимых для роли.
        - **Решение проблем**: Умение анализировать задачи и предлагать решения.
        - **Культурное и ролевое соответствие**: Соответствие ценностям компании и предполагаемой должности.
        - **Уверенность и ясность**: Уверенность в ответах, вовлечённость и ясность изложения.
        `,
			system:
				"Вы — профессиональный собеседник, анализирующий пробное интервью. Ваша задача — оценить кандидата на основе структурированных категорий",
		})

		const feedback = {
			interviewId: interviewId,
			userId: userId,
			totalScore: object.totalScore,
			categoryScores: object.categoryScores,
			strengths: object.strengths,
			areasForImprovement: object.areasForImprovement,
			finalAssessment: object.finalAssessment,
			createdAt: new Date().toISOString(),
		}

		let feedbackRef

		if (feedbackId) {
			feedbackRef = db.collection("feedback").doc(feedbackId)
		} else {
			feedbackRef = db.collection("feedback").doc()
		}

		await feedbackRef.set(feedback)

		return { success: true, feedbackId: feedbackRef.id }
	} catch (error) {
		console.error("Error saving feedback:", error)
		return { success: false }
	}
}

export async function getInterviewById(id: string): Promise<Interview | null> {
	const interview = await db.collection("interviews").doc(id).get()

	return interview.data() as Interview | null
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
	const { interviewId, userId } = params

	const querySnapshot = await db.collection("feedback").where("interviewId", "==", interviewId).where("userId", "==", userId).limit(1).get()

	if (querySnapshot.empty) return null

	const feedbackDoc = querySnapshot.docs[0]
	return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
	const { userId, limit = 20 } = params

	const interviews = await db
		.collection("interviews")
		.orderBy("createdAt", "desc")
		.where("finalized", "==", true)
		.where("userId", "!=", userId)
		.limit(limit)
		.get()

	return interviews.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as Interview[]
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
	if (!userId) return null

	const interviews = await db.collection("interviews").where("userId", "==", userId).orderBy("createdAt", "desc").get()

	return interviews.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as Interview[]
}
