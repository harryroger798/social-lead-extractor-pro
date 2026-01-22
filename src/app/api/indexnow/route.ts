import { NextRequest, NextResponse } from 'next/server'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'vedicstarastro2026indexnow'
const SITE_HOST = process.env.SITE_HOST || 'vedicstarastro.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      )
    }

    if (urls.length > 10000) {
      return NextResponse.json(
        { error: 'Maximum 10,000 URLs per request' },
        { status: 400 }
      )
    }

    const indexNowPayload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urls.map((url: string) => 
        url.startsWith('http') ? url : `https://${SITE_HOST}${url}`
      ),
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(indexNowPayload),
    })

    if (response.ok || response.status === 202) {
      return NextResponse.json({
        success: true,
        message: 'URLs submitted to IndexNow successfully',
        urlCount: urls.length,
      })
    }

    const errorText = await response.text()
    return NextResponse.json(
      { 
        error: 'IndexNow submission failed', 
        status: response.status,
        details: errorText 
      },
      { status: response.status }
    )
  } catch (error) {
    console.error('IndexNow API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'IndexNow API endpoint',
    usage: 'POST with { urls: ["/path1", "/path2"] }',
    key: INDEXNOW_KEY,
  })
}
