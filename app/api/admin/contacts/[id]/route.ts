import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getContactsCollection, Contact } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/admin/contacts/[id] - Get single contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase();
    const contactsCollection = getContactsCollection(db);

    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    const contact = await contactsCollection.findOne({ _id: new ObjectId(id) });

    if (!contact) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...contact,
        id: contact._id.toString(),
        _id: undefined
      }
    });

  } catch (error: any) {
    console.error('Get contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contacts/[id] - Update contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase();
    const contactsCollection = getContactsCollection(db);

    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    // Check if contact exists
    const existing = await contactsCollection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404 }
      );
    }

    // Build update data (only allow specific fields to be updated)
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.affiliate_status !== undefined) {
      updateData.affiliate_status = body.affiliate_status;
    }

    // Perform update
    await contactsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated contact
    const updated = await contactsCollection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        id: updated?._id.toString(),
        _id: undefined
      }
    });

  } catch (error: any) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contacts/[id] - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase();
    const contactsCollection = getContactsCollection(db);

    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    // Delete contact
    const result = await contactsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

