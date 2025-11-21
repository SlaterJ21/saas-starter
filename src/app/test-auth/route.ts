import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
    // Get all methods and properties
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(auth0));
    const ownProps = Object.getOwnPropertyNames(auth0);

    return NextResponse.json({
        methods,
        ownProps,
        type: typeof auth0,
        constructor: auth0.constructor.name,
    });
}