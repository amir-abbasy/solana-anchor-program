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
  let doctorPDA;
  let accessPDA;

  const userId = "user_02";  // Unique user ID
  const doctorId = "doctor_01";  // Unique user ID


  before(async () => {
    // Derive PDA
    [patientPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("patient"), wallet.publicKey.toBuffer(), Buffer.from(userId)],
      program.programId
    );

    [doctorPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("doctor"), Buffer.from(doctorId)],
      program.programId
    );

    [accessPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("access"), patientPDA.toBuffer(), doctorPDA.toBuffer()],
      program.programId
    );

    console.log("patient PDA:", patientPDA.toString());
    console.log("doctor PDA:", doctorPDA.toString());
    console.log("access PDA:", accessPDA.toString());

    // console.log("Wallet Public Key:", wallet.publicKey.toString());
  })

  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.createPatient(userId, 30).accounts({
  //     patient: patientPDA,
  //     authority: wallet.publicKey,
  //     systemProgram: anchor.web3.SystemProgram.programId,
  //   })
  //     // .signers([])
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });


  // it("Add Record", async () => {
  //   const recordId = 1
  //   const recordIdBN = new anchor.BN(recordId)
  //   const recordIdBuffer = recordIdBN.toArrayLike(Buffer, "le", 8); // 8 bytes for u64


  //   const [recordPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("record"), patientPDA.toBuffer(), recordIdBuffer],
  //     program.programId
  //   );


  //   // Add your test here.
  //   const tx = await program.methods.addRecord(recordIdBN, "Record_" + recordId).accounts({
  //     record: recordPDA,
  //     patient: patientPDA,
  //     authority: wallet.publicKey,
  //     systemProgram: anchor.web3.SystemProgram.programId,
  //   })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });


  // it("Grand Access", async () => {


  //   // Add your test here.
  //   const tx = await program.methods.grantAccess().accounts({
  //     patient: patientPDA,
  //     access: accessPDA,
  //     doctor: doctorPDA,
  //     authority: wallet.publicKey,
  //     systemProgram: anchor.web3.SystemProgram.programId,
  //   })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });


  // it("Fetches the patient account", async () => {
  //   try {
  //     const patientAccount = await program.account.patient.fetch(patientPDA);
  //     console.log("Account exists!", patientAccount);
  //   } catch (error) {
  //     console.error("Account not found!", error);
  //   }
  // });



  // it("Fetches the docotr access", async () => {
  //   try {
  //     const patientAccount = await program.account.access.all();
  //     console.log("Account exists!", patientAccount);
  //   } catch (error) {
  //     console.error("Account not found!", error);
  //   }
  // });



  it("Fetches the docotr access", async () => {
    try {
      const patientAccount = await program.account.access.fetch(accessPDA);
      console.log("access exists!", patientAccount.doctor);

      if (doctorPDA.toBase58() == patientAccount.doctor.toBase58()) {
        console.log("access has permission!", patientAccount.doctor);
      } else {
        console.log(patientAccount.doctor, " has no permission",);
        return
      }

      // Fetch all accounts of type "Record"
      const allRecords = await program.account.record.all();

      // Filter records that belong to the patient
      const patientRecords = allRecords.filter(record =>
        record.account.patient.toBase58() === patientPDA.toBase58()
      );

      console.log(patientRecords[0].account);
      
    } catch (error) {
      console.error("access not found!", error);
    }
  });






  // async function fetchPatientRecords(doctorPDA, patientPDA) {
  //   const [accessPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("access"), patientPDA.toBuffer(), doctorPDA.toBuffer()],
  //     program.programId
  //   );

  //   try {
  //     const accessAccount = await program.account.access.fetch(accessPDA);

  //     console.log("Access Found! Fetching records...");
  //     const patientData = await program.account.patient.fetch(patientPDA);
  //     console.log("Patient Records:", patientData);
  //   } catch (err) {
  //     console.error("Access not found! Doctor does not have permission.");
  //   }
  // }



  // const [doctorPDA] = anchor.web3.PublicKey.findProgramAddressSync(
  //   [Buffer.from("doctor"), Buffer.from(doctorId)],
  //   program.programId
  // );

  // // (async () => {
  // //   await fetchPatientRecords(doctorPDA, patientPDA)
  // // })()
  // fetchPatientRecords(doctorPDA, patientPDA)

});
