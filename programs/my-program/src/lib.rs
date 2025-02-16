use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
declare_id!("2FRr88R8DKckqF4nkPtybffhvUM65tC2SMDwNKPx4Y1c");

#[program]
pub mod my_program {
    use super::*;

    // Initialize a new Patient account
    pub fn create_patient(ctx: Context<CreatePatient>, user_id: String, age: u8) -> Result<()> {
        let patient = &mut ctx.accounts.patient;
        patient.user_id = user_id;
        patient.age = age;
        patient.authority = *ctx.accounts.authority.key;
        Ok(())
    }

    // Add a new Record for a Patient
    pub fn add_record(ctx: Context<AddRecord>, record_id: u64, record_data: String) -> Result<()> {
        let record = &mut ctx.accounts.record;
        record.id = record_id;
        record.data = record_data;
        record.patient = *ctx.accounts.patient.to_account_info().key;
        Ok(())
    }

    // Grant access to a doctor
    pub fn grant_access(ctx: Context<GrantAccess>) -> Result<()> {
        let access = &mut ctx.accounts.access;
        access.patient = *ctx.accounts.patient.to_account_info().key;
        access.doctor = *ctx.accounts.doctor.to_account_info().key;
        Ok(())
    }

    // Revoke access from a doctor
    // pub fn revoke_access(ctx: Context<RevokeAccess>) -> Result<()> {
    //     // Deleting the access account revokes access
    //     Ok(())
    // }

    // // View a patient's record (only if authorized)
    // pub fn view_record(ctx: Context<ViewRecord>) -> Result<()> {
    //     let access = &ctx.accounts.access;
    //     let record = &ctx.accounts.record;

    //     // Check if the caller is the patient or an authorized doctor
    //     require!(
    //         ctx.accounts.viewer.key() == &ctx.accounts.patient.authority || ctx.accounts.viewer.key() == &access.doctor,
    //         ErrorCode::Unauthorized
    //     );

    //     // Log the record data (or return it to the client)
    //     msg!("Record ID: {}", record.id);
    //     msg!("Record Data: {}", record.data);
    //     Ok(())
    // }
}

// Context for creating a Patient account
#[derive(Accounts)]
#[instruction(user_id: String)]
pub struct CreatePatient<'info> {
    #[account(init, payer = authority, space = Patient::LEN, seeds = [b"patient", authority.key().as_ref(), &user_id.as_bytes(), ], bump)]
    pub patient: Account<'info, Patient>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Context for adding a Record account
#[derive(Accounts)]
#[instruction(record_id: u64)]  // <-- Accept user_id as an argument
pub struct AddRecord<'info> {
    #[account(init, payer = authority, space = Record::LEN, seeds = [b"record", patient.key().as_ref(), &record_id.to_le_bytes()], bump)]
    pub record: Account<'info, Record>,
    #[account(mut)]
    pub patient: Account<'info, Patient>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Context for granting access to a doctor
#[derive(Accounts)]
pub struct GrantAccess<'info> {
    #[account(mut, has_one = authority)]
    pub patient: Account<'info, Patient>,
    #[account(init, payer = authority, space = Access::LEN, seeds = [b"access", patient.key().as_ref(), doctor.key().as_ref()], bump)]
    pub access: Account<'info, Access>,
    /// CHECK: The doctor's public key (no account needed)
    pub doctor: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Context for revoking access from a doctor
#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(mut, has_one = authority)]
    pub patient: Account<'info, Patient>,
    #[account(mut, close = authority, seeds = [b"access", patient.key().as_ref(), doctor.key().as_ref()], bump)]
    pub access: Account<'info, Access>,
    /// CHECK: The doctor's public key (no account needed)
    pub doctor: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

// // Context for viewing a record
// #[derive(Accounts)]
// pub struct ViewRecord<'info> {
//     #[account(mut)]
//     pub patient: Account<'info, Patient>,
//     #[account(mut)]
//     pub record: Account<'info, Record>,
//     #[account(mut, seeds = [b"access", patient.key().as_ref(), viewer.key().as_ref()], bump)]
//     pub access: Account<'info, Access>,
//     pub viewer: Signer<'info>, // The caller (patient or doctor)
// }

// Patient account structure
#[account]
pub struct Patient {
    pub user_id: String, // Patient's name (max 40 chars)
    pub age: u8,     // Patient's age
    pub authority: Pubkey, // Authority (patient's wallet)
}

impl Patient {
    const LEN: usize = 8 + 40 + 1 + 32; // 8 (discriminator) + 40 (name) + 1 (age) + 32 (authority)
}

// Access account structure
#[account]
pub struct Access {
    pub patient: Pubkey, // Associated Patient account
    pub doctor: Pubkey,  // Authorized doctor's public key
}

impl Access {
    const LEN: usize = 8 + 32 + 32; // 8 (discriminator) + 32 (patient) + 32 (doctor)
}

// Record account structure
#[account]
pub struct Record {
    pub id: u64,       // Unique ID for the record
    pub data: String,  // Record data (max 500 chars)
    pub patient: Pubkey, // Associated Patient account
}

impl Record {
    const LEN: usize = 8 + 8 + 500 + 32; // 8 (discriminator) + 8 (id) + 500 (data) + 32 (patient)
}

// Custom error codes
#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to view this record.")]
    Unauthorized,
}