use anchor_lang::prelude::*;

declare_id!("2FRr88R8DKckqF4nkPtybffhvUM65tC2SMDwNKPx4Y1c");

#[program]
pub mod my_program {
    use super::*;

    pub fn create_patient(ctx: Context<NewPatient>, _user_id: String, name: String) -> Result<()> {
        let patient = &mut ctx.accounts.patient;

        patient.owner = ctx.accounts.user.key(); // Set the owner
        // patient.user_id = _user_id;
        patient.name = name;
        patient.records = Vec::new();
        Ok(())
    }

    pub fn add_record(ctx: Context<AddRecord>, _user_id: String, record: String) -> Result<()> {
        let patient = &mut ctx.accounts.patient;
        // require_keys_eq!(patient.owner, ctx.accounts.owner.key(), CustomError::Unauthorized);

        patient.records.push(record);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_user_id: String)]  // <-- Accept user_id as an argument
pub struct NewPatient<'info> {
    #[account(
        init, 
        seeds = [b"patient", _user_id.as_bytes().as_ref(), user.key().as_ref()],  
        bump,
        payer = user, 
        space = 8 + 40 + 1000
    )]
    pub patient: Account<'info, Patient>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_user_id: String)]  // <-- Accept user_id as an argument
pub struct AddRecord<'info> {
    #[account(mut, seeds = [b"patient", _user_id.as_bytes().as_ref(), patient.owner.as_ref()], bump)]
    pub patient: Account<'info, Patient>,
    pub user: Signer<'info>,
}

#[account]
pub struct Patient {
    pub user_id: String,
    pub owner: Pubkey,
    pub name: String,
    pub records: Vec<String>,
}
