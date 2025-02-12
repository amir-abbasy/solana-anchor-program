import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";

describe("my-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);
  // Get the wallet from the provider
  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  const wallet = provider.wallet;

  let patientPDA;

  const userId = "user_1";  // Unique user ID


  before(async () => {
    // Derive PDA
    [patientPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("patient"), Buffer.from(userId), wallet.publicKey.toBuffer()],
      program.programId
    );

    console.log("Derived PDA:", patientPDA.toString());
    console.log("Wallet Public Key:", wallet.publicKey.toString());

  })

  it("Is initialized!", async () => {
    try {

      // Add your test here.
      const tx = await program.methods.createPatient(userId, "AMIR").accounts({
        patient: patientPDA,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
        .signers([])
        .rpc();
      console.log("Your transaction signature", tx);

    } catch (error) {
      console.error("may already in use", error);
    }
  });

  it("Add Record", async () => {
    // Add your test here.
    const tx = await program.methods.addRecord(userId, "Patient visited for checkup 104").accounts({
      patient: patientPDA,
      user: wallet.publicKey
    })
      .rpc();
    console.log("Your transaction signature", tx);
  });


  it("Fetches the patient account", async () => {
    try {
      const patientAccount = await program.account.patient.fetch(patientPDA);
      console.log("Account exists!", patientAccount);
    } catch (error) {
      console.error("Account not found!", error);
    }
  });


});
