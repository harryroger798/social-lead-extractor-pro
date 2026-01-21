import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

// Create Sanity client with write permissions
const sanityClient = createClient({
  projectId: "5q99si1y",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST - Submit a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, content, postId, parentCommentId, honeypot } = body;

    // Honeypot spam check - if this field is filled, it's likely a bot
    if (honeypot) {
      // Silently reject spam but return success to not tip off bots
      return NextResponse.json({
        success: true,
        message: "Comment submitted for review",
      });
    }

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Comment must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Comment must be less than 2000 characters" },
        { status: 400 }
      );
    }

    if (!postId || typeof postId !== "string") {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Check if Sanity token is configured
    if (!process.env.SANITY_API_TOKEN) {
      console.error("SANITY_API_TOKEN not configured");
      return NextResponse.json(
        { success: false, error: "Comment system is not configured" },
        { status: 503 }
      );
    }

    // Create comment document
    const commentDoc: {
      _type: string;
      name: string;
      email: string;
      content: string;
      post: { _type: string; _ref: string };
      parentComment?: { _type: string; _ref: string };
      approved: boolean;
      createdAt: string;
    } = {
      _type: "comment",
      name: name.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      post: {
        _type: "reference",
        _ref: postId,
      },
      approved: false, // Comments require admin approval
      createdAt: new Date().toISOString(),
    };

    // Add parent comment reference if this is a reply
    if (parentCommentId && typeof parentCommentId === "string") {
      commentDoc.parentComment = {
        _type: "reference",
        _ref: parentCommentId,
      };
    }

    // Create the comment in Sanity
    await sanityClient.create(commentDoc);

    return NextResponse.json({
      success: true,
      message: "Comment submitted for review. It will appear after approval.",
    });
  } catch (error) {
    console.error("Comment submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit comment. Please try again." },
      { status: 500 }
    );
  }
}

// GET - Fetch approved comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Fetch approved comments for the post
    const comments = await sanityClient.fetch(
      `*[_type == "comment" && post._ref == $postId && approved == true] | order(createdAt desc) {
        _id,
        name,
        content,
        createdAt,
        "parentCommentId": parentComment._ref
      }`,
      { postId }
    );

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Comment fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
