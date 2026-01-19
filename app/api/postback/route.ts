import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aff_click_id = searchParams.get('aff_click_id');
    const goal = searchParams.get('goal');

    if (!aff_click_id || !goal) {
      return NextResponse.json(
        { success: false, message: 'Missing parameters' },
        { status: 400 }
      );
    }

    console.log(`Postback received: ${goal} for affiliate ${aff_click_id}`);

    return NextResponse.json({
      success: true,
      message: `Postback for ${goal} received.`
    });
  } catch (error) {
    console.error('Postback error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

